---
slug: 283
title: 'AI 翻唱训练用音频预处理讨论'
# draft: true
author: yexca
date: '2026-06-02T17:23:44+09:00'
categories:
    - 折腾经验
tags:
    - Roformer
    - AI
    - 音乐
---

现在的技术完全靠 AI 做到提取干声还是不大现实，多数情况下是需要手工修正。不过只要数据量足够大，总是可以凑到被 AI 提取干声后适合训练的音频

本文讲述一种我作为一个外行纯用 AI 对于训练用音频筛选的工作流，全部使用开源软件

## 训练与推理的音频

关于 AI 翻唱的音频自己最近的研究大概可以总结为 "训练挑剔音质，推理挑剔音高"

也就是训练用的音频和推理用的音频应该分开讨论

对于推理用的音频重点在于音高，也就是针对和声进行处理较好即可，有无电音是其次

但是对于训练用的音频，就需要用到近乎完美的音频才可以

## 音质

首先尽量筛选音质高的音频，最好是无损音质文件，但或许选择好处理的音频 (背景噪音容易处理) 会获得更好的效果

对于具体的音质，可以使用 [alexkay/spek](https://github.com/alexkay/spek) 软件进行查看

注意：将有损音质转换为无损格式并不会提升音质，具体使用软件查看即可知道

## 音高

训练用的音频最好覆盖较为宽泛的音高范围，一般而言常规说话状态下

- 男生: 85Hz - 180Hz
- 女生: 165Hz - 255Hz

而如果是唱歌的话，理论上建议覆盖 E2 (82Hz) - C5(523Hz)，当然如果有假音需求，上限可以拉到 800Hz

如果可能的话，使用类似"啊~""呜~"之类的声音往往可以为模型提供最完整的 F0 连续特征

现在主流的 AI 翻唱模型使用 RMVPE 算法提取音高，理论上效果更好，不过可以简单使用 `praat` 大概查看下音高参考，首先安装依赖库

```bash
pip install praat-parselmouth numpy matplotlib
```

然后创建一个 `pitch.py` 文件输入以下内容

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

该程序读取当前目录的 `audio` 文件夹下所有音频文件的音高，然后在终端输出总结，并在当前目录绘制一个音高图

将所有音频文件放入 `audio` 文件夹后运行命令查看音高

```bash
python pitch.py
```

## 干声提取

使用 [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) 可以运行较为多的模型

安装 gpu 版本

```bash
pip install audio-separator[gpu]
```

查看模型

```bash
audio-separator --list_models
# filter
audio-separator -l --list_filter=vocals --list_limit=5
```

目前效果较好的一般是 MelBand Roformer 模型，而该模型在 audio-separator 属于 MDXC 架构，关于该架构有一些通用参数可以使用

- `--mdxc_segment_size=512`: 分段大小，越大提升模型上下文理解力，理论上效果会越好
- `--mdxc_override_model_segment_size`: 强制修改分段大小，覆盖模型的默认值
- `--mdxc_overlap=8`: 预测窗口之间的重叠次数，范围 2-50，理论上越高效果越平滑
- `--mdxc_batch_size=4`: 同时进行的处理数量，按照显存调整
- `--mdxc_pitch_shift=0`: 音高变调调整，一般保持默认 0 即可

另外处理很长的音频的时候，进行分段处理速度往往更快

```bash
# Process an 8-hour podcast in 10-minute chunks
audio-separator long_podcast.wav --chunk_duration 600
```

那么模型应该如何选呢，这里参考 [AliceNavigator/Music-Source-Separation-Training-GUI](https://github.com/AliceNavigator/Music-Source-Separation-Training-GUI) 将模型分为四类，分别是去伴奏 (提取人声)、去和声、去混响以及其他 (像是降噪、去气泡音等)

具体的模型选择的话，可以参考模型的 SDR 值，也就是信噪比，理论上越高效果越好，这里给出一些参考模型

### 去伴奏

对于提取出人声来说，一般而言 Roformer Model: MelBand Roformer Kim | FT 3 by unwa 是不错的，具体使用方法为

```bash
audio-separator ./step1_inputs --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs

# 如果调整一些参数的话
audio-separator ./step1_input --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs --mdxc_segment_size=512 --mdxc_overlap=8 --mdxc_batch_size=8
```

然后带有 `vocals` 标识的则为提取出的人声，可以放入下一步的处理流程

### 去和声

有些歌曲是有两人以上的声音，这个时候需要使用去和声模型，获得主唱的声音，一般而言使用 karaoke 模型系列，比如 Roformer Model: MelBand Roformer | Karaoke V2 by Gabox，使用方法为

```bash
audio-separator ./step2_inputs --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

处理完成后，带有 `vocals` 标识的则为主唱声音，可以放入下一步的处理流程

另外如果是男女双主唱，可以尝试使用 Roformer Model: BS Roformer | Chorus Male-Female by Sucial 模型，模型文件为 `model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt`

### 去混响

如果是做翻唱，可以使用 Roformer Model: MelBand Roformer | De-Reverb by anvuew

如果是训练模型，推荐使用单声道版本 Roformer Model: MelBand Roformer | De-Reverb Mono by anvuew

原因为当前 AI 模型在训练时统一采用单声道音频，如果输入为双声道的话可能会因为双声道的相位差在训练时引入杂音

```bash
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_anvuew_sdr_19.1729.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs

# 单声道版本
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_mono_anvuew.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs
```

带有 `noreverb` 标识的则为去混响文件

### 其他模型

例如去噪音模型，使用 Roformer Model: Mel-Roformer-Denoise-Aufr33 去除麦克风和环境底噪

```bash
audio-separator ./step4_inputs --model_filename denoise_mel_band_roformer_aufr33_sdr_27.9959.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step4_outputs
```

还有像是去除气泡音的模型 Roformer Model: MelBand Roformer | Aspiration by Sucial，模型文件为 `aspiration_mel_band_roformer_sdr_18.9845.ckpt`

### 其他架构

关于去噪音，还有一个模型 `DeepFilterNet3` 对于非音乐音频效果可能不错，比较方便使用的是 [Shuichi346/DeepFilterNet3-VST3](https://github.com/Shuichi346/DeepFilterNet3-VST3)，这是一个 DAW 的插件，所以需要安装 DAW 进行使用，另外作者只提供了 MacOS 版本，所以其他平台需要自己编译

关于 DAW 可以选择 [REAPER](https://www.reaper.fm/)，该软件是官方无限试用，所以可以免费使用

关于编译 VST3 插件，需要安装 Rust，下载 [Rustup-init](https://rustup.rs/) 运行后遇到选项选择 `1` 保持默认即可，期间会要求下载 Visual Studio，不要修改可选项直接全部下载即可

下载完成后，本地克隆项目并进入目录

```bash
git clone https://github.com/Shuichi346/DeepFilterNet3-VST3.git
cd DeepFilterNet3-VST3
```

开始编译

```bash
cargo xtask bundle deepfilter-vst --release
```

编译完成后去 `target` 文件夹里多翻几层找到 `deepfilter-vst.vst3` 文件，将其放入 `C:\Program Files\Common Files\VST3` 文件夹下

打开 REAPER，拖入音频文件后，点击左侧的 FX 查找添加后即可

我个人感觉实际使用效果不是特别好，许多声音都被去除了，所以可以尝试下吧

## 规范化音频

模型训练的最大峰值音量最好在 -3dB 到 -6dB 之间，太高的话可能导致破音

而低于 -40dB 的部分会被下一步 "切片" 给剔除，所以在这一步可以把音频最高音规范化到 -3dB

安装依赖项

```bash
pip install ffmpeg-normalize
```

这条命令会处理当前目录下所有的 wav，并把规范化后的文件保存在 normalized 文件夹中，记得提前创建 normalized 文件夹

```bash 
ffmpeg-normalize *.wav -nt peak -t -3 -ext wav -o normalized/
```

其中的命令部分解释如下

- `-nt peak`: nt 是 Normalization Type (规范化类型)，这里指定为峰值
- `-t -3`: 目标值设置为 -3dB
- `-ext wav`: 输出 wav 格式
- `-o`: 输出文件夹

这样就会让所有被训练的音频的最高音量规范化为 -3dB

## 切片

使用 [flutydeer/audio-slicer](https://github.com/flutydeer/audio-slicer) 自动进行音频分割，然后选择听起来自然的音频

挑选出听起来比较不错的片段用于训练模型，每个片段不要低于 2s，最好大于 4s

总共时长大概 10-30min 即可，最高不超过 2h，筛选完成后在 PowerShell 环境下用以下命令查看当前所有 `wav` 文件的合计时长

```powershell
$totalSeconds = Get-ChildItem -Recurse -Filter *.wav | ForEach-Object { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $_.FullName } | Measure-Object -Sum | Select-Object -ExpandProperty Sum; [Timespan]::FromSeconds($totalSeconds) | ForEach-Object { "{0} h {1} m {2} s" -f [Math]::Floor($_.TotalHours), $_.Minutes, $_.Seconds }
```


## 筛选

从训练好并切分后的音频里，筛选掉机械音，保留正常的声音片段，使用 [foobar2000](https://www.foobar2000.org/) 软件可以获得无任何混响的音频播放，也就是我们听到的就是模型实际听到的声音

下载安装打开后选择布局 (Main Layout) 尽量选择 Playlist 比较大的，比如 `Slim View + Tabs`

- 选择输出设备

按 `Ctrl+P` 打开设置界面，在 `Playback->Output` 中 `Device` 选择带 `exclusive` 的

- 设置快捷键用于快速删除

在设置界面的 `Keyboard Shortcuts` 里添加新快捷键，`Action` 处搜索 `delete`，选择 `[context]->File Operations->Delete file(s)`，然后 `Key` 处添加按键，比如 `Ctrl+D`

设置完成后，将所有音频拖入播放列表后，开始播放筛选

## 感想

就目前的 AI 能力来看，貌似暂时是不需要太过于担心就业，因为至少在音频领域，还是处于工具阶段，依然是提升工作效率，至少不能让纯外行的我直接作出完美的作品

虽然会在一直发展，但是有传统工具经验者还是有不可替代的价值
