---
slug: 283
title: 'Discussion on Audio Preprocessing for AI Cover Training'
# draft: true
author: yexca
date: '2026-06-02T17:23:44+09:00'
categories:
    - Hands-on Experience
tags:
    - Roformer
    - AI
    - Music
---

{{< notice >}} This article was translated by gemini-3.5-flash {{< /notice >}}

Completely relying on AI to extract clean vocals is still not quite realistic with current technology; in most cases, manual correction is needed. However, as long as you have enough data, you can always scrape together enough AI-extracted vocals suitable for training.

This article discusses a workflow for filtering training audio using only AI, from the perspective of an outsider. Everything used here is open-source.

## Training vs. Inference Audio

My recent research on AI cover audio can be summarized as: "Training is picky about audio quality, inference is picky about pitch."

In other words, we should treat training audio and inference audio differently.

For inference, the focus is on pitch. It's fine as long as you handle the harmonies well; whether there is auto-tune/robotic sound is secondary.

But for training, you need almost perfect audio.

## Audio Quality

First, try to filter for high-quality audio. Lossless files are best, but choosing audio that is easy to process (where background noise is easy to clean up) might actually yield better results.

To check actual audio quality, you can use [alexkay/spek](https://github.com/alexkay/spek).

Note: Converting lossy audio to a lossless format won't magically improve the quality. You can verify this yourself using the software.

## Pitch

Training audio should ideally cover a wide pitch range. Generally, for normal speaking:

- Male: 85Hz - 180Hz
- Female: 165Hz - 255Hz

For singing, it's theoretically recommended to cover E2 (82Hz) to C5 (523Hz). Of course, if you need falsetto, you can push the upper limit to 800Hz.

If possible, using sustained sounds like "ah~" or "oo~" can provide the model with the most complete F0 continuous features.

Most mainstream AI cover models currently use the RMVPE algorithm for pitch extraction, which theoretically works better. However, you can use `praat` to quickly check the pitch reference. First, install the dependencies:

```bash
pip install praat-parselmouth numpy matplotlib
```

Then create a `pitch.py` file and add the following code:

```python
import os
import glob
import numpy as np
import parselmouth
import matplotlib.pyplot as plt

def analyze_dataset_pitch(directory=".", outlier_percentile=1.0):
    """
    Scans the directory for audio files, extracts pitch frames using Praat,
    aggregates all valid F0 data, and filters out statistical outliers 
    to find the true effective pitch range.
    """
    audio_formats = ('*.wav', '*.flac', '*.ogg', '*.mp3')
    audio_files = []
    for ext in audio_formats:
        audio_files.extend(glob.glob(os.path.join(directory, ext)))
    
    if not audio_files:
        print(f"[Error] No supported audio files found in directory: '{directory}'")
        return

    print(f"[Info] Found {len(audio_files)} audio files. Starting Praat F0 extraction...")
    print("-" * 65)

    all_pitch_frames = []

    for file_path in audio_files:
        file_name = os.path.basename(file_path)
        try:
            # Load audio into Praat engine
            snd = parselmouth.Sound(file_path)
            pitch = snd.to_pitch()
            pitch_values = pitch.selected_array['frequency']
            
            # Filter out unvoiced frames (Praat assigns 0 to silence/unvoiced)
            voiced_frames = pitch_values[pitch_values > 0]
            
            if len(voiced_frames) == 0:
                print(f" File: {file_name[:25]:<25} | No valid voiced speech detected.")
                continue
            
            # Append to global pool for dataset-wide distribution analysis
            all_pitch_frames.extend(voiced_frames)
            
            file_min = np.min(voiced_frames)
            file_max = np.max(voiced_frames)
            print(f" File: {file_name[:25]:<25} | Range: {file_min:.1f} Hz - {file_max:.1f} Hz")

        except Exception as e:
            print(f"[Warning] Failed to process {file_name}: {e}")

    print("-" * 65)
    
    if not all_pitch_frames:
        print("[Error] Total aggregated pitch data is empty.")
        return

    # Convert global pool to numpy array
    all_pitch_frames = np.array(all_pitch_frames)

    # 1. Absolute Range (Vulnerable to noise)
    abs_min = np.min(all_pitch_frames)
    abs_max = np.max(all_pitch_frames)

    # 2. Robust Range using Percentiles (Trims the extreme edges)
    # E.g., if outlier_percentile=1.0, we take 1st to 99th percentile
    lower_bound = np.percentile(all_pitch_frames, outlier_percentile)
    upper_bound = np.percentile(all_pitch_frames, 100.0 - outlier_percentile)

    # 3. Mode/Peak Analysis (Where the voice actually concentrates)
    # Using a quick histogram-based density peak estimation
    counts, bin_edges = np.histogram(all_pitch_frames, bins=50)
    primary_peak_index = np.argmax(counts)
    primary_peak_hz = (bin_edges[primary_peak_index] + bin_edges[primary_peak_index + 1]) / 2

    # Print comprehensive statistical summary
    print("\n" + "="*25 + " FINAL PITCH PROFILE " + "="*25)
    print(f" Total Voiced Frames Analyzed : {len(all_pitch_frames)}")
    print(f" Absolute Raw Range           : {abs_min:.1f} Hz to {abs_max:.1f} Hz (Includes anomalies)")
    print(f" Primary Pitch Concentration  : ~{primary_peak_hz:.1f} Hz (Most frequent pitch)")
    print(f" Effective RVC Target Range   : {lower_bound:.1f} Hz to {upper_bound:.1f} Hz (Trimmed 1% outliers)")
    print("=" * 71)

    # Optional Visual Distribution Check (Saves a distribution plot to help spot multi-cluster gaps)
    try:
        plt.figure(figsize=(10, 5))
        plt.hist(all_pitch_frames, bins=100, density=True, alpha=0.6, color='skyblue', label='Pitch Density')
        plt.axvline(lower_bound, color='red', linestyle='--', label=f'Effective Min ({lower_bound:.1f} Hz)')
        plt.axvline(upper_bound, color='red', linestyle='--', label=f'Effective Max ({upper_bound:.1f} Hz)')
        plt.title('Dataset Pitch Distribution & Effective Bound Identification')
        plt.xlabel('Frequency (Hz)')
        plt.ylabel('Density')
        plt.legend()
        plt.grid(axis='x', alpha=0.3)
        
        plot_filename = "dataset_pitch_distribution.png"
        plt.savefig(plot_filename)
        print(f"[Info] Distribution plot saved successfully as '{plot_filename}'")
    except Exception as e:
        print(f"[Warning] Could not generate visualization plot: {e}")

if __name__ == "__main__":
    # Analyzes current working directory
    analyze_dataset_pitch(directory="./audio", outlier_percentile=1.0)
```

This script reads the pitch of all audio files in the `audio` folder of the current directory, outputs a summary to the terminal, and plots a pitch distribution graph in the same directory.

Place all your audio files in the `audio` folder, then run the command to check the pitch:

```bash
python pitch.py
```

## Vocal Extraction

Using [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) allows you to run quite a few models.

Install the GPU version:

```bash
pip install audio-separator[gpu]
```

List available models:

```bash
audio-separator --list_models
# filter
audio-separator -l --list_filter=vocals --list_limit=5
```

Currently, MelBand Roformer models usually yield the best results. In `audio-separator`, these models use the MDXC architecture. Here are some common parameters you can tweak for this architecture:

- `--mdxc_segment_size=512`: Segment size. Larger values improve the model's context understanding, theoretically leading to better results.
- `--mdxc_override_model_segment_size`: Forcefully overrides the model's default segment size.
- `--mdxc_overlap=8`: Overlap between prediction windows (range 2-50). Theoretically, higher values produce smoother transitions.
- `--mdxc_batch_size=4`: Number of parallel processes. Adjust based on your VRAM.
- `--mdxc_pitch_shift=0`: Pitch shifting. Usually keep it at 0.

Also, when dealing with very long audio, chunking it is often faster:

```bash
# Process an 8-hour podcast in 10-minute chunks
audio-separator long_podcast.wav --chunk_duration 600
```

So, how do we choose the right model? Referencing [AliceNavigator/Music-Source-Separation-Training-GUI](https://github.com/AliceNavigator/Music-Source-Separation-Training-GUI), we can categorize models into four types: instrumental removal (vocal extraction), harmony removal, de-reverb, and others (like denoise, de-breath, etc.).

For specific model selection, look at the SDR (Signal-to-Distortion Ratio) value. Generally, the higher the better. Here are some recommended models:

### Vocal Extraction (Instrumental Removal)

For extracting vocals, `Roformer Model: MelBand Roformer Kim | FT 3 by unwa` is generally a solid choice. Usage:

```bash
audio-separator ./step1_inputs --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs

# Tweaking some parameters
audio-separator ./step1_input --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs --mdxc_segment_size=512 --mdxc_overlap=8 --mdxc_batch_size=8
```

The output file with the `vocals` tag is the extracted vocals, which you can pass to the next step.

### Harmony Removal

Some songs have multiple vocalists. In this case, you need a harmony removal model to isolate the lead vocal. Typically, you'd use the karaoke model series, such as `Roformer Model: MelBand Roformer | Karaoke V2 by Gabox`. Usage:

```bash
audio-separator ./step2_inputs --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

Once processed, the file with the `vocals` tag is the lead vocal, ready for the next step.

If you have a male/female duet, you can try the `Roformer Model: BS Roformer | Chorus Male-Female by Sucial` model (file name: `model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt`).

### De-Reverb

If you're making a cover, you can use `Roformer Model: MelBand Roformer | De-Reverb by anvuew`.

If you're training a model, I highly recommend the mono version: `Roformer Model: MelBand Roformer | De-Reverb Mono by anvuew`.

This is because current AI models train on mono audio. If you feed them stereo, the phase difference between channels might introduce artifacts/noise during training.

```bash
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_anvuew_sdr_19.1729.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs

# Mono version
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_mono_anvuew.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs
```

The output with the `noreverb` tag is your de-reverbed file.

### Other Models

For example, noise reduction: Use `Roformer Model: Mel-Roformer-Denoise-Aufr33` to strip out mic hiss and ambient background noise.

```bash
audio-separator ./step4_inputs --model_filename denoise_mel_band_roformer_aufr33_sdr_27.9959.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step4_outputs
```

There is also a model to remove breath/aspiration noise: `Roformer Model: MelBand Roformer | Aspiration by Sucial` (file name: `aspiration_mel_band_roformer_sdr_18.9845.ckpt`).

### Other Architectures

For noise reduction, the `DeepFilterNet3` model works quite well on non-music audio. The easiest way to use it is via [Shuichi346/DeepFilterNet3-VST3](https://github.com/Shuichi346/DeepFilterNet3-VST3). This is a DAW plugin, so you'll need a DAW installed. Also, the author only provides a MacOS build, so you'll have to compile it yourself on other platforms.

For the DAW, [REAPER](https://www.reaper.fm/) is a solid choice. It offers an unlimited evaluation period, meaning you can technically use it for free.

To compile the VST3 plugin, you need Rust. Download [Rustup-init](https://rustup.rs/), run it, and hit `1` to keep the defaults. It will ask to download Visual Studio during the setup—just go with the defaults and download everything.

Once installed, clone the repo and cd into the directory:

```bash
git clone https://github.com/Shuichi346/DeepFilterNet3-VST3.git
cd DeepFilterNet3-VST3
```

Start compiling:

```bash
cargo xtask bundle deepfilter-vst --release
```

Once compiled, dig through the nested folders in the `target` directory to find `deepfilter-vst.vst3`, and copy it to `C:\Program Files\Common Files\VST3`.

Open REAPER, drag in an audio file, click the FX button on the left, search for the plugin, and add it.

Personally, I didn't find the results all that great—it aggressively filters out too much of the actual voice—but feel free to give it a shot.

## Audio Normalization

For model training, the peak volume is best kept between -3dB and -6dB. Anything higher might cause clipping.

Since anything below -40dB will be stripped out by the "slicing" step later, you can normalize the peak volume to -3dB at this stage.

Install the dependencies:

```bash
pip install ffmpeg-normalize
```

This command processes all `.wav` files in the current directory and saves the normalized files to the `normalized` folder. Make sure to create the `normalized` folder first.

```bash 
ffmpeg-normalize *.wav -nt peak -t -3 -ext wav -o normalized/
```

Command options breakdown:

- `-nt peak`: Normalization Type. Here we specify peak normalization.
- `-t -3`: Target value set to -3dB.
- `-ext wav`: Output format set to wav.
- `-o`: Output directory.

This ensures all training audio peaks at exactly -3dB.

## Slicing

Use [flutydeer/audio-slicer](https://github.com/flutydeer/audio-slicer) to automatically split the audio, then pick the segments that sound natural.

Filter out the best-sounding clips for training. Make sure each clip is at least 2 seconds long, preferably over 4 seconds.

A total duration of 10-30 minutes is usually enough; don't go over 2 hours. After sorting, you can check the total duration of all `.wav` files using this command in PowerShell:

```powershell
$totalSeconds = Get-ChildItem -Recurse -Filter *.wav | ForEach-Object { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $_.FullName } | Measure-Object -Sum | Select-Object -ExpandProperty Sum; [Timespan]::FromSeconds($totalSeconds) | ForEach-Object { "{0} h {1} m {2} s" -f [Math]::Floor($_.TotalHours), $_.Minutes, $_.Seconds }
```


## Filtering (Dataset Cleanup)

From the sliced audio, weed out any robotic/glitched sounds and keep only normal voice clips. Using [foobar2000](https://www.foobar2000.org/) is great for this because it lets you play back audio without any system-level enhancement or reverb. What you hear is exactly what the model will "hear."

Download, install, and open it. For the layout, pick one with a large playlist area, like `Slim View + Tabs`.

- **Select Output Device**

  Press `Ctrl+P` to open preferences. Go to `Playback -> Output`, and for `Device`, choose one with `exclusive` mode.

- **Set a Hotkey for Quick Deletion**

  In `Keyboard Shortcuts`, add a new shortcut. Search for `delete` under `Action`, select `[context]->File Operations->Delete file(s)`, and assign a hotkey like `Ctrl+D`.

Now, just drag all your audio files into the playlist and start auditing.

## Final Thoughts

Looking at what AI can do right now, there's probably no need to panic about losing your job just yet. At least in the audio domain, it's still very much in the "utility tool" phase. It boosts productivity, but it still won't let a complete amateur like me produce a flawless, professional piece of work out of the box.

While AI will keep improving, people with experience in traditional tools still hold irreplaceable value.