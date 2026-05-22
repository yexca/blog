---
slug: 280
title: 'AI Covers with Roformer and Applio'
# draft: true
author: yexca
date: '2026-05-23T03:00:06+09:00'
categories:
    - Tweaks
tags:
    - Roformer
    - RVC
    - Applio
    - AI
---

{{< notice >}} This article was translated by gemini-3.5-flash {{< /notice >}}

## Getting Audio

For training, real lossless audio is highly recommended (specifically `pcm_f32le` WAV files). It's best to rip them from physical albums. You can refer to this guide: <https://www.bilibili.com/opus/925630344961458181>, but skip the FLAC conversion and export directly to WAV.

This guide uses Applio (based on the RVC architecture). You'll need about 10 to 60 minutes of clean vocals (acapella) to get good training results. Don't exceed 2 hours. Remember, quality over quantity: Garbage In, Garbage Out!

### YouTube

You can use `yt-dlp` to download audio from YouTube. Note that this is converted from lossy formats, so it's not true lossless audio.

GitHub: [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

Download YouTube audio in the highest quality:

```bash
yt-dlp -x --audio-format wav --audio-quality 0 --embed-thumbnail [video_url]
```

For longer audio (over 10 mins), you can split it using ffmpeg:

```bash
ffmpeg -i input.wav -f segment -segment_time 600 -c copy output_%03d.wav
```

> This splits the audio every 10 minutes. Change `-segment_time 600` to adjust the duration.

To merge them back into a single file, create a `filelist.txt` listing all segments:

```markdown
file 'output_000.wav'
file 'output_001.wav'
file 'output_002.wav'
```

Then run this command to merge:

```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy finished.wav
```

To extract a specific segment (e.g., a 15-minute clip starting at the 10-minute mark):

```bash
ffmpeg -ss 00:10:00 -i input.wav -t 00:15:00 -c copy part1.wav
```

### Other Sources

For `flac`, `mp3`, or other formats, convert them to WAV for inference using ffmpeg:

```bash
for %i in (*.flac) do ffmpeg -i "%i" "%~ni.wav"
for %i in (*.mp3) do ffmpeg -i "%i" "%~ni.wav"
```

Even if you convert lossy files to WAV, it doesn't magically make them lossless. Getting WAVs ripped directly from physical albums is always best.

## Vocal Extraction (Acapella)

### Setting Up the Environment

First, install Miniconda. Create and activate a new environment:

```bash
conda create -n roformer python=3.12
conda activate roformer 
```

Install PyTorch:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

Install [openmirlab/bs-roformer-infer](https://github.com/openmirlab/bs-roformer-infer):

```bash
pip install bs-roformer-infer
```

Install [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator):

```bash
pip install audio-separator[gpu]
```

### Downloading Models

Run these commands to list available models:

```bash
bs-roformer-download --list-models
# audio-separator
audio-separator --list_models
```

As of 2026-05-21, the output of `bs-roformer-download` is:

```markdown
Name                                                             Category      Checkpoint
-----------------------------------------------------------------------------------------
Roformer Model: BS Roformer SW by jarredou                       vocals        BS-Rofo-SW-Fixed.ckpt
Roformer Model: BS Roformer | Chorus Male-Female by Sucial       vocals        model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt
Roformer Model: BS Roformer | Instrumental Resurrection by unwa  instrumental  bs_roformer_instrumental_resurrection_unwa.ckpt
Roformer Model: BS Roformer | Male-Female by aufr33              vocals        bs_roformer_male_female_by_aufr33_sdr_7.2889.ckpt
Roformer Model: BS Roformer | Vocals Resurrection by unwa        vocals        bs_roformer_vocals_resurrection_unwa.ckpt
Roformer Model: BS Roformer | Vocals Revive V2 by Unwa           vocals        bs_roformer_vocals_revive_v2_unwa.ckpt
Roformer Model: BS Roformer | Vocals Revive V3e by Unwa          vocals        bs_roformer_vocals_revive_v3e_unwa.ckpt
Roformer Model: BS Roformer | Vocals Revive by Unwa              vocals        bs_roformer_vocals_revive_unwa.ckpt
Roformer Model: BS Roformer | Vocals by Gabox                    vocals        bs_roformer_vocals_gabox.ckpt
Roformer Model: BS-Roformer-De-Reverb                            dereverb      deverb_bs_roformer_8_384dim_10depth.ckpt

Available categories: dereverb, instrumental, vocals
```

Here is a quick breakdown of what these models do:

- BS Roformer SW by jarredou: Separates audio into 7 tracks (bass, drums, guitar, instrumental, other, piano, vocals).
- BS Roformer | Chorus Male-Female by Sucial: Separates male vocals, female vocals, and reverb.
- BS Roformer | Instrumental Resurrection by unwa: Instrumental HD reconstruction, great for restoring old backing tracks.
- BS Roformer | Male-Female by aufr33: Separates male and female vocals.
- BS Roformer | Vocals Resurrection by unwa: Vocal HD reconstruction (aggressive version of Revive) to restore old vocals.
- BS Roformer | Vocals Revive Series: Vocal restoration, kind of like image upscaling but for audio.
- BS Roformer | Vocals by Gabox: Standard vocal isolation. Unlike the 7-track SW model, this only separates instrumental and vocals.
- BS-Roformer-De-Reverb: Dereverb.

Download the models you need. We'll grab two here, but since one of the built-in links is dead, we'll download it manually.

```bash
bs-roformer-download --model "Roformer Model: BS Roformer SW by jarredou"
# The following built-in download link is broken
bs-roformer-download --model "Roformer Model: BS-Roformer-De-Reverb"
```

You can find the dereverb model on Hugging Face: [anvuew/dereverb_bs_roformer](https://huggingface.co/anvuew/dereverb_bs_roformer)

Download the model and its `.yaml` config file, then place them in the correct folder. It's recommended to rename the `.yaml` file to match the model filename.

### Audio Processing

We'll do this in three steps: first, extract vocals using `BS Roformer SW by jarredou`, then isolate the main vocals from backing vocals using `Roformer Model: MelBand Roformer | Karaoke V2 by Gabox`, and finally strip reverb using `Roformer Model: BS-Roformer-De-Reverb` to get the final dry vocals (acapella).

You can experiment with swapping steps 2 and 3. Different tracks might require a different order for the best results.

First, create directories for the inputs and outputs of each step:

```bash
mkdir step1_input, step1_outputs, step2_input, step2_outputs, step3_input, step3_outputs
```

Put your music in `step1_input` (English filenames recommended). Make sure they are in lossless WAV format.

#### <1> Multi-track Splitting

Use `BS Roformer SW by jarredou` to split the tracks. Edit the model's `.yaml` file to add these settings (located in `models/roformer-model-bs-roformer-sw-by-jarredou`):

```yaml
inference:
  batch_size: 16
  dim_t: 1101
  chunk_size: 352768
  num_overlap: 8
  normalize: false
```

Adjust these settings based on your hardware:

- batch_size: Scale this based on your VRAM. For 16GB VRAM, use 16.
- dim_t: Do not touch. This is the model's trained time-domain dimension.
- chunk_size: This is missing from the downloaded config. Add it manually and set it to `352768`.
- num_overlap: Set between 2 and 10 depending on your VRAM.
- normalize: Keep it `false`.

Start inference:

```bash
bs-roformer-infer --config_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.yaml --model_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.ckpt --input_folder ./step1_input --store_dir ./step1_outputs
```

Once done, copy the file ending with `_vocals.wav` into the step 2 input folder `step2_input`.

##### (Optional) Mixing with MSST for Better Results

Usually, using a single model is enough. But if you want the absolute best quality, you can run the audio through MSST-BSRNN to get `vocals_msst.wav`, then merge it with Roformer's `vocals_roformer.wav` using ffmpeg:

```bash
ffmpeg -i vocals_roformer.wav -i vocals_msst.wav -filter_complex "amix=inputs=2:duration=longest:normalize=0" -c:a pcm_s16le vocals_combined.wav
```

Parameter breakdown:

- `normalize=0`: Disables dynamic adaptive envelope to prevent sudden volume or detail drops.
- `-c:a pcm_s16le`: Lossless output.

#### <2> Vocal Purification

Since the backing vocal extraction model uses a different architecture, we'll use `audio-separator`. It will download the model automatically on the first run:

```bash
audio-separator ./step2_input --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

After processing, `Vocals` contains the lead singer, and `Instrumental` contains the backing vocals. Move the `Vocals` file to the step 3 input folder `step3_input`.

#### <3> Room De-reverb

Use `BS-Roformer-De-Reverb` to remove room reverb from the vocals. You can adjust the `.yaml` config:

```bash
inference:
  batch_size: 16
  dim_t: 876
  num_overlap: 8
```

Do not change `dim_t`. Adjust the other two options based on your VRAM.

Start inference:

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.yaml --model_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

The file ending with `_noreverb.wav` is your final dry vocal track.

##### (Optional) Separating Male and Female Vocals

For male-female duets, you can split the voices first using `BS Roformer | Chorus Male-Female by Sucial` (download it from [Sucial/Chorus_Male_Female_BS_Roformer](https://huggingface.co/Sucial/Chorus_Male_Female_BS_Roformer)):

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.yaml --model_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

## Voice Conversion

Using Applio for voice conversion (RVC architecture).

Project URL: [IAHispano/Applio](https://github.com/IAHispano/Applio)

### Installation

Super easy to set up. Clone the repository:

```bash
git clone https://github.com/IAHispano/Applio.git
```

Go to the root directory and run `run-install.bat` to install.

Once installed, launch it by running `run-applio.bat`.

### Training a Model

Go to the "Training" tab. Under "Model Settings", enter a new "Model Name".

In the "Preprocess" section, create a dataset and upload your clean dry vocals. Click "Preprocess Dataset" once uploaded.

Keep defaults in the "Extract" section and click "Extract Features".

In the "Training" section, adjust "Batch Size" based on your VRAM:

- 8GB: 4 or 8
- 12-16GB: 12-16
- 24GB+: 24-32

Keep "Save Every Epoch" at the default `10`.

Set "Total Epoch" to 200-300. This range usually yields the best results (around 220-250 epochs is often the sweet spot).

Agree to the terms, click "Generate Index", and then click "Start Training".

### Inference

Once trained, go to the "Inference" tab. Choose your model. Start testing with the 200-250 epoch checkpoints, then adjust up or down.

Advanced Settings breakdown:

- Split Audio: Enable for long audio to prevent VRAM overflow. For regular 3-minute songs, leaving it disabled might yield better results.
- Autotune: Turn on for singing, keep off for spoken monologues.
- Clean Audio: Enable if needed.

Faders below:

- Pitch: Male-to-female set to +12, female-to-male set to -12, same-gender set to 0.
- Search Feature Ratio: 0.7-0.8 for singing, 0.6-0.7 for podcasts and spoken audio.
- Protect Voiceless Consonants: Around 0.33 to 0.5 for singing, 0.5 for others.

Agree to the terms and click "Convert".

### (Optional) Stereo Audio Inference

Applio only outputs mono audio, so processing stereo inputs directly sounds weird. To fix this, split the channels first, infer them separately, and then merge.

Split channels using ffmpeg:

```bash
ffmpeg -i input.wav -filter_complex "[0:a]pan=mono|c0=c0[left];[0:a]pan=mono|c0=c1[right]" -map "[left]" left.wav -map "[right]" right.wav
```

After running inference on both files, merge them back into stereo:

```bash
ffmpeg -i left_output.wav -i right_output.wav -filter_complex "[0:a][1:a]join=inputs=2:channel_layout=stereo[a]" -map "[a]" final_stereo.wav
```

### Troubleshooting: Port Conflict

If you get a port conflict error, open `app.py` in the root directory and change `DEFAULT_PORT = 6969` to another number.

Avoid Windows reserved ports. You can list them in PowerShell using:

```bash
netsh int ipv4 show excludedportrange protocol=tcp
```

## Mixing

Merge your converted dry vocals with the backing track isolated during the **Multi-track Splitting** step.

Since we isolated the backing vocals, you can mix them back into the step 1 instrumental track to create a new backing track. Then use `ffmpeg` to mix the dry vocals with the new backing track:

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex amix=inputs=2:duration=longest output.wav
```

Pure dry vocals can sound dry and flat. Adding some reverb makes it sound much better:

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:40:0.4[v_rev]; [v_rev][1:a]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

Parameter breakdown for `aecho=0.8:0.88:40:0.4`:

- `0.8`: In Gain (input volume going into the effect).
- `0.88`: Out Gain (total volume after the reverb effect).
- `40`: Delays (in milliseconds, simulating sound bouncing off walls).
- `0.4`: Decays (decay factor, giving it a subtle trailing tail).

These settings mimic a basic studio. For a stage/hall effect, use `aecho=0.8:0.88:80:0.5`. For subtle touch-ups, use `aecho=0.8:0.88:35:0.25`.

---

The above is an equal mix. You can also mix them with custom volumes:

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]volume=1.0[v]; [1:a]volume=0.4[b]; [v][b]amix=inputs=2:duration=longest:dropout_transition=0[a]" -map "[a]" output.wav
```

This sets the first input (vocals) to 100% volume `[0:a]volume=1.0[v]` and the second input (backing track) to 40% volume `[1:a]volume=0.4[b]`.

To apply reverb and adjust the backing track volume at the same time:

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:35:0.25[v_rev]; [1:a]volume=0.8[bgm_v]; [v_rev][bgm_v]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

## Conclusion

I tried about three models with this fully automated workflow. The results aren't perfect. For some tracks, manual tuning and cleanup in a DAW are still needed for top-tier results.

Also, `bs-roformer-infer` used here is a bit outdated—many models are hard to find or have broken links. I'll look into newer tools in the future and share my findings in a new post.

This guide isn't flawless, but it's a solid log of my learning process. After all, that's what blogging is all about.