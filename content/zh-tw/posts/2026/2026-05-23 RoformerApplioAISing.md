---
slug: 280
title: '使用 Roformer 與 Applio 進行 AI 翻唱'
# draft: true
author: yexca
date: '2026-05-23T03:00:06+09:00'
categories:
    - 摺騰經驗
tags:
    - Roformer
    - RVC
    - Applio
    - AI
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

## 取得音訊

訓練推薦使用真無損音訊，也就是 `pcm_f32le` 格式的音訊檔案，推薦購買實體專輯後匯出，可以參考 <https://www.bilibili.com/opus/925630344961458181> 但不要轉換為 flac 格式，直接輸出為 wav 格式

本文章使用 RVC 架構的 Applio，訓練大概需要 10min-60min 的乾聲以取得較好的結果，不過最多不要超過 2h，另外品質大於數量，Garbage In, Garbage Out!

### YouTube

關於從 YouTube 取得音訊，可以使用 `yt-dlp` 下載，這裡取得的也是從有損格式轉換，並不是真無損音樂

GitHub: [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

下載最高音質的 YouTube 影片的音訊

```bash
yt-dlp -x --audio-format wav --audio-quality 0 --embed-thumbnail [video_url]
```

如果是較長的音訊 (超過 10min)，可透過 ffmpeg 進行分割

```bash
ffmpeg -i input.wav -f segment -segment_time 600 -c copy output_%03d.wav
```

> 這裡將按 10min 一次分割，若要改成其他分鐘可更改 `-segment_time 600` 為其他數字

合併為同一檔案可以先建立一個 `filelist.txt` 檔案列出所有片段

```markdown
file 'output_000.wav'
file 'output_001.wav'
file 'output_002.wav'
```

然後使用指令合併

```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy finished.wav
```

關於精準擷取一個片段，例如從 10min 開始擷取 15min 的話

```bash
ffmpeg -ss 00:10:00 -i input.wav -t 00:15:00 -c copy part1.wav
```

### 其他來源

對於其他來源的 `flac, mp3` 等格式的音樂，可以使用 ffmpeg 轉換格式以進行推理

```bash
for %i in (*.flac) do ffmpeg -i "%i" "%~ni.wav"
for %i in (*.mp3) do ffmpeg -i "%i" "%~ni.wav"
```

但就算是從有損格式轉換為無損格式，也並不是說歌曲變成無損的了，建議直接使用從實體專輯擷取出的 wav 音訊

## 擷取乾聲

### 建置環境

首先安裝 MiniConda。建立環境並啟用

```bash
conda create -n roformer python=3.12
conda activate roformer 
```

安裝 PyTorch

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

安裝 [openmirlab/bs-roformer-infer](https://github.com/openmirlab/bs-roformer-infer)

```bash
pip install bs-roformer-infer
```

安裝 [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator)

```bash
pip install audio-separator[gpu]
```

### 下載模型

使用指令查看目前可用模型

```bash
bs-roformer-download --list-models
# audio-separator
audio-separator --list_models
```

2026-05-21 時 `bs-roformer-download` 執行輸出為

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

這裡的模型大概用途如下：

- BS Roformer SW by jarredou: 可以分離出 bass, drums, guitar, instrumental, other, piano, vocals 七種音軌
- BS Roformer | Chorus Male-Female by Sucial: 分離出男聲、女聲和殘響
- BS Roformer | Instrumental Resurrection by unwa: 伴奏超高解析重構模型，修復老歌的伴奏
- BS Roformer | Male-Female by aufr33: 分離出男聲和女聲
- BS Roformer | Vocals Resurrection by unwa: 人聲超高解析重構模型，Revive 的激進版本，修復老歌的人聲
- BS Roformer | Vocals Revive Series: 人聲修復模型，類似畫質超解析度的感覺
- BS Roformer | Vocals by Gabox: 標準人聲分離，對比第一個 SW 的七種音軌，這個只能分離出伴奏和人聲
- BS-Roformer-De-Reverb: 去殘響

下載需要的模型，這裡下載兩個模型，不過因為下載連結失效，其中一個需要另外下載

```bash
bs-roformer-download --model "Roformer Model: BS Roformer SW by jarredou"
# 以下內置下載連結失效
bs-roformer-download --model "Roformer Model: BS-Roformer-De-Reverb"
```

關於去殘響模型可以在 <huggingface.co> 找到下載，連結為：[anvuew/dereverb_bs_roformer](https://huggingface.co/anvuew/dereverb_bs_roformer)

下載模型檔案和設定檔 `yaml` 並放在對應資料夾下，建議將設定檔 `yaml` 重新命名為與模型相同的檔名

### 音訊處理

這裡進行三步處理，首先使用 `BS Roformer SW by jarredou` 分離出人聲，然後使用 `Roformer Model: MelBand Roformer | Karaoke V2 by Gabox` 分離出和聲，最後使用 `Roformer Model: BS-Roformer-De-Reverb` 去殘響，從而得到最終的乾聲

當然第二步和第三步可以對調嘗試看看，說不定效果也會變更好，具體根據音樂不同，最佳解也不同

首先建立輸入輸出資料夾，這裡有三個步驟，所以建立每一步的輸入輸出

```bash
mkdir step1_input, step1_outputs, step2_input, step2_outputs, step3_input, step3_outputs
```

在 `step1_input` 放入音樂 (推薦使用英文命名)，注意使用無損 wav 格式

#### <1> 多軌拆分

使用 `BS Roformer SW by jarredou` 進行多軌拆分。修改模型 `yaml` 設定檔，新增相關設定項目 (路徑在 `models/roformer-model-bs-roformer-sw-by-jarredou`)

```yaml
inference:
  batch_size: 16
  dim_t: 1101
  chunk_size: 352768
  num_overlap: 8
  normalize: false
```

這些設定項目根據裝置效能進行調整

- batch_size: 依顯示記憶體選擇，顯示記憶體越大填越大，例如 16G 顯示記憶體填寫 16
- dim_t: 請勿修改，這是模型訓練的時間域維度
- chunk_size: 下載的設定缺少該項，按照上例新增並填入 `352768`
- num_overlap: 依顯示記憶體選擇 2-10
- normalize: 保持 false

開始推理

```bash
bs-roformer-infer --config_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.yaml --model_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.ckpt --input_folder ./step1_input --store_dir ./step1_outputs
```

推理完成後將副檔名為 `_vocals.wav` 的檔案放入第二步輸入資料夾 `step2_input`

##### (optional) 與 MSST 混合取得更好的效果

一般情況下單獨使用任何一種的效果已經夠用，不過如果追求極致的話，可以使用 MSST-BSRNN 跑一遍得到人聲 `vocals_msst.wav`，然後將其與 Roformer 跑出的人聲 `vocals_roformer.wav` 進行雙軌融合，然後使用該檔案進行接下來的步驟，可以直接使用 `ffmpeg` 進行融合

```bash
ffmpeg -i vocals_roformer.wav -i vocals_msst.wav -filter_complex "amix=inputs=2:duration=longest:normalize=0" -c:a pcm_s16le vocals_combined.wav
```

其中部分參數解釋

- `normalize=0`: 關閉動態自適應包絡，防止聲音細節和音量產生突變
- `-c:a pcm_s16le`: 無損輸出

#### <2> 人聲純化

擷取和聲使用的模型因為架構不同需要 `audio-separator`，該工具執行時會自動下載

```bash
audio-separator ./step2_input --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

推理完成後 Vocals 是主唱，Instrumental 為和聲，將 Vocals 檔案放入第三步的輸入資料夾 `step3_input`

#### <3> 空間淨化

使用 `BS-Roformer-De-Reverb` 去除人聲裡的殘響，可以調整 `yaml` 設定

```bash
inference:
  batch_size: 16
  dim_t: 876
  num_overlap: 8
```

其中 `dim_t` 不要修改，另外兩項依顯示記憶體修改

開始推理

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.yaml --model_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

推理完成後獲得副檔名為 `_noreverb.wav` 的檔案即為乾聲

##### (optional) 分離男女聲

如果有男女合唱的話，可以先使用 `BS Roformer | Chorus Male-Female by Sucial` 將聲音分離後擷取 (該模型可以去 [Sucial/Chorus_Male_Female_BS_Roformer](https://huggingface.co/Sucial/Chorus_Male_Female_BS_Roformer) 下載)

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.yaml --model_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

## 變聲

使用 Applio 進行變聲處理 (RVC 架構)

專案地址：[IAHispano/Applio](https://github.com/IAHispano/Applio)

### 安裝

安裝非常方便，複製 (git clone) 原始碼

```bash
git clone https://github.com/IAHispano/Applio.git
```

進入根目錄執行 `run-install.bat` 即可開始安裝

安裝完成後執行 `run-applio.bat` 即可啟動

### 訓練模型

選擇 Training 標籤頁，在 Model Settings 新增一個 Model Name

然後在 Preprocess (預處理) 模組建立一個新的資料集並上傳一些乾聲，上傳完成後點擊 `Preprocess Dataset`

Extract 模組保持預設即可，點擊 `Extract Features`

Training 模組根據顯示記憶體調整 Batch Size

- 8G: 4 or 8
- 12-16G: 12-16
- 24G-: 24-32

Save Every Epoch 保持預設 10 即可

Total Epoch 推薦 200-300，一般資料集在這個輪數下會比較好 (大概 220-250 是最佳模型，具體可從這個範圍向上或向下嘗試)

調整完成後同意條款，建立索引 (Generate Index) 後開始訓練 (Start Training)

### 推理

訓練完成模型後，變聲功能在 Inference (推理) 標籤頁，選擇模型，可以先從 200-250 輪的模型測試，然後調高或降低輪數

關於進階選項 (Advanced Settings) 的選項

- Split Audio: 長音訊勾選以防止顯示記憶體溢位，歌曲 (3min) 可能不勾選效果更好
- Autotune (自動電音/修音): 唱歌可勾選，獨白不勾選
- Clean Audio (音訊降噪): 視情況勾選

下方調整欄

- Pitch (音高): 男變女增加 12，女變男減少 12，相同為 0
- Search Feature Ratio (檢索特徵占比/索引率): 唱歌推薦 0.7-0.8，而 Podcast、長獨白等推薦 0.6-0.7
- Protect Voiceless Consonants (保護清輔音和呼吸聲): 唱歌可調到 0.33 左右，也可以是 0.5，其他 0.5

調整完成後同意條款，開始轉換 (Convert)

### (optional) 雙聲道音訊推理

Applio 只能輸出單聲道，所以輸入立體聲音訊的處理效果超級奇怪，這裡使用先分離聲道、推理，然後再合併的方法

使用 `ffmpeg` 分離聲道

```bash
ffmpeg -i input.wav -filter_complex "[0:a]pan=mono|c0=c0[left];[0:a]pan=mono|c0=c1[right]" -map "[left]" left.wav -map "[right]" right.wav
```

分別進行推理後，合併為立體聲

```bash
ffmpeg -i left_output.wav -i right_output.wav -filter_complex "[0:a][1:a]join=inputs=2:channel_layout=stereo[a]" -map "[a]" final_stereo.wav
```

### (question) 連接埠佔用問題

如果顯示連接埠被佔用的話，開啟程式根目錄的 `app.py`，修改 `DEFAULT_PORT = 6969` 為其他數值

儘量避開 Windows 預留連接埠，這些連接埠可透過以下指令在 PowerShell 中查看

```bash
netsh int ipv4 show excludedportrange protocol=tcp
```

## 混音

變聲後的乾聲再和之前 **多軌拆分** 步驟分離的伴奏合併即可

因為將和聲分離出來了，可以先試著將第二步的和聲與第一步的伴奏混合成為新伴奏，然後使用 `ffmpeg` 將乾聲和新伴奏混合，指令都是一樣的，如下

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex amix=inputs=2:duration=longest output.wav
```

當然純乾聲並不是很好聽，加點殘響效果可能更好

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:40:0.4[v_rev]; [v_rev][1:a]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

其中對於 `aecho=0.8:0.88:40:0.4` 參數解釋如下

- `0.8`: In Gain 也就是輸入音量，乾聲進效果器的音量
- `0.88`: Out Gain 也就是輸出音量，殘響完出來的總音量
- `40`: Delays 延遲時間，聲音碰到牆壁回彈
- `0.4`: Decays 衰減係數，讓聲音有淡淡的尾音延伸

這個參數是簡易錄音室的效果感覺，舞台感使用 `aecho=0.8:0.88:80:0.5`，只是微調可以使用 `aecho=0.8:0.88:35:0.25`

---

上面是均衡混合，可以設定混合為不同的音量

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]volume=1.0[v]; [1:a]volume=0.4[b]; [v][b]amix=inputs=2:duration=longest:dropout_transition=0[a]" -map "[a]" output.wav
```

這裡先輸入的第一個音訊 (乾聲) 為 100% 音量 `[0:a]volume=1.0[v]` 而第二個音訊 (伴奏) 為 40% 音量 `[1:a]volume=0.4[b]`

而殘響加上調整伴奏音量的話

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:35:0.25[v_rev]; [1:a]volume=0.8[bgm_v]; [v_rev][bgm_v]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

## 結語

這樣無人工干預的效果我嘗試了大概三個模型，效果並不是特別理想，對於部分音訊還是人工干預進行處理效果會更好

另外這裡使用的 `bs-roformer-infer` 稍微有點過時，不僅模型少而且多數下載失效。如果允許的話，之後我會嘗試使用更新的工具，屆時再繼續發布文章

這篇文章並不完美，但這也算是我學習的紀錄，部落格不就是用來記錄這些的嘛