---
slug: 283
title: 'AI 翻唱訓練用音訊預處理討論'
# draft: true
author: yexca
date: '2026-06-02T17:23:44+09:00'
categories:
    - 折騰經驗
tags:
    - Roformer
    - AI
    - 音樂
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

現在的技術完全靠 AI 做到提取乾聲還是不太現實，多數情況下需要手動修正。不過只要資料量足夠大，總是可以湊出被 AI 提取乾聲後適合訓練的音訊。

本文分享一種我作為一個外行，純粹使用 AI 進行訓練用音訊篩選的工作流程，全部使用開源軟體。

## 訓練與推論的音訊

關於 AI 翻唱的音訊，自己最近的研究大概可以總結為「訓練挑剔音質，推論挑剔音高」。

也就是訓練用的音訊和推論用的音訊應該分開討論。

對於推論用的音訊，重點在於音高，也就是針對和聲進行處理較好即可，有無電音是其次。

但是對於訓練用的音訊，就需要用到近乎完美的音訊才可以。

## 音質

首先儘量篩選音質高的音訊，最好是無損音質檔案，但或許選擇好處理的音訊 (背景噪音容易處理) 會獲得更好的效果。

對於具體的音質，可以使用 [alexkay/spek](https://github.com/alexkay/spek) 軟體進行查看。

注意：將有損音質轉換為無損格式並不會提升音質，具體使用軟體查看即可知道。

## 音高

訓練用的音訊最好覆蓋較為寬廣的音高範圍，一般而言常規說話狀態下：

- 男生: 85Hz - 180Hz
- 女生: 165Hz - 255Hz

而如果是唱歌的話，理論上建議覆蓋 E2 (82Hz) - C5 (523Hz)，當然如果有假音需求，上限可以拉到 800Hz。

如果可能的話，使用類似「啊~」「嗚~」之類的聲音，往往可以為模型提供最完整的 F0 連續特徵。

現在主流的 AI 翻唱模型使用 RMVPE 演算法提取音高，理論上效果更好，不過可以簡單使用 `praat` 大致查看一下音高參考，首先安裝相依函式庫：

```bash
pip install praat-parselmouth numpy matplotlib
```

然後建立一個 `pitch.py` 檔案並輸入以下內容：

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
            # 將音訊載入 Praat 引擎
            snd = parselmouth.Sound(file_path)
            pitch = snd.to_pitch()
            pitch_values = pitch.selected_array['frequency']
            
            # 濾除未發音框架（Praat 會將靜音/未發音指派為 0）
            voiced_frames = pitch_values[pitch_values > 0]
            
            if len(voiced_frames) == 0:
                print(f" File: {file_name[:25]:<25} | No valid voiced speech detected.")
                continue
            
            # 新增到全域池中以進行資料集範圍的分布分析
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

    # 1. 絕對範圍（易受雜訊影響）
    abs_min = np.min(all_pitch_frames)
    abs_max = np.max(all_pitch_frames)

    # 2. 使用百分位數的強健範圍（修剪極端邊緣）
    # 例如，如果 outlier_percentile=1.0，我們取第 1 到第 99 百分位數
    lower_bound = np.percentile(all_pitch_frames, outlier_percentile)
    upper_bound = np.percentile(all_pitch_frames, 100.0 - outlier_percentile)

    # 3. 眾數/峰值分析（聲音實際集中的地方）
    # 使用基於直方圖的快速密度峰值估算
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

    # 選用的視覺化分布檢查（儲存分布圖以協助發現多群集間隙）
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
    # 分析目前的工作目錄
    analyze_dataset_pitch(directory="./audio", outlier_percentile=1.0)
```

該程式讀取目前目錄的 `audio` 資料夾下所有音訊檔案的音高，然後在終端機輸出總結，並在目前目錄繪製一張音高圖。

將所有音訊檔案放入 `audio` 資料夾後執行命令查看音高：

```bash
python pitch.py
```

## 乾聲提取

使用 [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) 可以執行較多種類的模型。

安裝 GPU 版本：

```bash
pip install audio-separator[gpu]
```

查看模型：

```bash
audio-separator --list_models
# filter
audio-separator -l --list_filter=vocals --list_limit=5
```

目前效果較好的通常是 MelBand Roformer 模型，而該模型在 audio-separator 中屬於 MDXC 架構，關於該架構有一些通用參數可以使用：

- `--mdxc_segment_size=512`：分段大小，越大越能提升模型的上下文理解能力，理論上效果會越好。
- `--mdxc_override_model_segment_size`：強制修改分段大小，覆蓋模型的預設值。
- `--mdxc_overlap=8`：預測窗口之間的重疊次數，範圍為 2-50，理論上越高效果越平滑。
- `--mdxc_batch_size=4`：同時進行的處理數量，請依顯示記憶體（VRAM）調整。
- `--mdxc_pitch_shift=0`：音高變調調整，一般保持預設值 0 即可。

另外在處理很長的音訊時，進行分段處理的速度通常會更快。

```bash
# Process an 8-hour podcast in 10-minute chunks
audio-separator long_podcast.wav --chunk_duration 600
```

那麼模型應該如何選擇呢？這裡參考 [AliceNavigator/Music-Source-Separation-Training-GUI](https://github.com/AliceNavigator/Music-Source-Separation-Training-GUI) 將模型分為四類，分別是：去伴奏（提取人聲）、去和聲、去殘響以及其他（例如降噪、去氣泡音等）。

具體模型選擇的話，可以參考模型的 SDR 值（即訊噪比），理論上越高效果越好，這裡提供一些參考模型：

### 去伴奏

對於提取人聲來說，一般而言 Roformer Model: MelBand Roformer Kim | FT 3 by unwa 是很不錯的，具體使用方法為：

```bash
audio-separator ./step1_inputs --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs

# 如果調整一些參數的話
audio-separator ./step1_input --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs --mdxc_segment_size=512 --mdxc_overlap=8 --mdxc_batch_size=8
```

然後帶有 `vocals` 標記的即為提取出的人聲，可以放入下一步的處理流程。

### 去和聲

有些歌曲包含兩人以上的聲音，這時候需要使用去和聲模型來獲得主唱的聲音。一般而言會使用 karaoke 模型系列，例如 Roformer Model: MelBand Roformer | Karaoke V2 by Gabox，使用方法為：

```bash
audio-separator ./step2_inputs --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

處理完成後，帶有 `vocals` 標記的即為主唱聲音，可以放入下一步的處理流程。

另外如果是男女雙主唱，可以嘗試使用 Roformer Model: BS Roformer | Chorus Male-Female by Sucial 模型，模型檔案為 `model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt`。

### 去殘響

如果是做翻唱，可以使用 Roformer Model: MelBand Roformer | De-Reverb by anvuew。

如果是訓練模型，推薦使用單聲道版本 Roformer Model: MelBand Roformer | De-Reverb Mono by anvuew。

原因在於目前的 AI 模型在訓練時統一採用單聲道音訊，如果輸入為雙聲道，可能會因為雙聲道的相位差在訓練時引入雜音。

```bash
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_anvuew_sdr_19.1729.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs

# 單聲道版本
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_mono_anvuew.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs
```

帶有 `noreverb` 標記的即為去殘響檔案。

### 其他模型

例如降噪模型，使用 Roformer Model: Mel-Roformer-Denoise-Aufr33 去除麥克風和環境底噪：

```bash
audio-separator ./step4_inputs --model_filename denoise_mel_band_roformer_aufr33_sdr_27.9959.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step4_outputs
```

還有像是去除氣泡音的模型 Roformer Model: MelBand Roformer | Aspiration by Sucial，模型檔案為 `aspiration_mel_band_roformer_sdr_18.9845.ckpt`。

### 其他架構

關於降噪，還有一個模型 `DeepFilterNet3` 對於非音樂音訊效果可能不錯。比較方便使用的是 [Shuichi346/DeepFilterNet3-VST3](https://github.com/Shuichi346/DeepFilterNet3-VST3)，這是一個 DAW 的外掛插件，所以需要安裝 DAW 才能使用。另外作者只提供了 macOS 版本，因此其他平台需要自己編譯。

關於 DAW 可以選擇 [REAPER](https://www.reaper.fm/)，該軟體官方提供無限期試用，因此可以免費使用。

關於編譯 VST3 插件，需要安裝 Rust。下載 [Rustup-init](https://rustup.rs/) 執行後，遇到選項選擇 `1` 保持預設即可。期間會要求下載 Visual Studio，不要修改選用項目，直接全部下載即可。

下載完成後，在本機複製（clone）專案並進入目錄：

```bash
git clone https://github.com/Shuichi346/DeepFilterNet3-VST3.git
cd DeepFilterNet3-VST3
```

開始編譯：

```bash
cargo xtask bundle deepfilter-vst --release
```

編譯完成後，去 `target` 資料夾裡多找幾層，找到 `deepfilter-vst.vst3` 檔案，將其放進 `C:\Program Files\Common Files\VST3` 資料夾下。

開啟 REAPER，拖入音訊檔案後，點擊左側的 FX 搜尋並新增即可。

我個人感覺實際使用效果不是特別好，許多聲音都被濾掉了，不過還是可以嘗試看看。

## 音訊正規化

模型訓練的最大峰值音量最好在 -3dB 到 -6dB 之間，太高的話可能導致破音。

而低於 -40dB 的部分會被下一步的「切片」給剃除，所以在這一步可以把音訊的最高音量正規化到 -3dB。

安裝相依套件：

```bash
pip install ffmpeg-normalize
```

這條指令會處理目前目錄下所有的 wav 檔，並把正規化後的檔案儲存在 `normalized` 資料夾中，記得提前建立 `normalized` 資料夾：

```bash 
ffmpeg-normalize *.wav -nt peak -t -3 -ext wav -o normalized/
```

其中的指令部分解釋如下：

- `-nt peak`：nt 是 Normalization Type（正規化類型），這裡指定為峰值。
- `-t -3`：目標值設定為 -3dB。
- `-ext wav`：輸出 wav 格式。
- `-o`：輸出資料夾。

這樣就會讓所有用於訓練的音訊最高音量正規化為 -3dB。

## 切片

使用 [flutydeer/audio-slicer](https://github.com/flutydeer/audio-slicer) 自動進行音訊分割，然後選擇聽起來自然的音訊。

挑選出聽起來比較不錯的片段用於訓練模型，每個片段不要低於 2 秒，最好大於 4 秒。

總時長大概 10-30 分鐘即可，最高不超過 2 小時。篩選完成後，在 PowerShell 環境下使用以下指令查看目前所有 `wav` 檔案的合計時長：

```powershell
$totalSeconds = Get-ChildItem -Recurse -Filter *.wav | ForEach-Object { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $_.FullName } | Measure-Object -Sum | Select-Object -ExpandProperty Sum; [Timespan]::FromSeconds($totalSeconds) | ForEach-Object { "{0} h {1} m {2} s" -f [Math]::Floor($_.TotalHours), $_.Minutes, $_.Seconds }
```


## 篩選

從訓練好並切分後的音訊中，篩選掉機械音，保留正常的聲音片段。使用 [foobar2000](https://www.foobar2000.org/) 軟體可以播放無任何殘響的音訊，也就是說，我們聽到的就是模型實際聽到的聲音。

下載、安裝並開啟後，版面配置（Main Layout）儘量選擇播放清單（Playlist）比較大的，例如 `Slim View + Tabs`。

- 選擇輸出裝置

按 `Ctrl+P` 開啟設定畫面，在 `Playback -> Output` 中的 `Device` 選擇帶有 `exclusive` 的裝置。

- 設定快捷鍵以快速刪除

在設定畫面的 `Keyboard Shortcuts` 裡新增快捷鍵，在 `Action` 處搜尋 `delete`，選擇 `[context] -> File Operations -> Delete file(s)`，然後在 `Key` 處新增按鍵，例如 `Ctrl+D`。

設定完成後，將所有音訊拖入播放清單，就可以開始播放並進行篩選。

## 感想

就目前的 AI 能力來看，似乎暫時還不需要太過擔心失業，因為至少在音訊領域，AI 依然處於工具階段，主要還是用來提升工作效率，至少還無法讓純外行的我直接做出完美的成品。

雖然技術會持續發展，但擁有傳統工具經驗的人，依然有其不可替代的價值。