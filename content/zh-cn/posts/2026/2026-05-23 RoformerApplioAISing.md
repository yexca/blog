---
slug: 280
title: '使用 Roformer 与 Applio 进行 AI 翻唱'
# draft: true
author: yexca
date: '2026-05-23T03:00:06+09:00'
categories:
    - 折腾经验
tags:
    - Roformer
    - RVC
    - Applio
    - AI
---

## 获取音频

训练推荐使用真无损音频，也就是 `pcm_f32le` 格式的音频文件，推荐购买实体专辑后导出，可以参考 <https://www.bilibili.com/opus/925630344961458181> 但不要转换为 flac 格式，直接输出为 wav 格式

本文章使用 RVC 架构的 Applio，训练大概需要 10min-60min 的干声以获取较好的结果，不过最多不要超过 2h，另外质量大于数量，Garbage In, Garbage Out!

### Youtube

关于从 Youtube 获取音频，可以使用 `yt-dlp` 下载，这里获取的也是从有损格式转换，并不是真无损音乐

Github: [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)

下载最高音质的 YouTube 视频的音频

```bash
yt-dlp -x --audio-format wav --audio-quality 0 --embed-thumbnail [video_url]
```

如果是较长的音频 (超过 10min)，可通过 ffmpeg 进行分割

```bash
ffmpeg -i input.wav -f segment -segment_time 600 -c copy output_%03d.wav
```

> 这里将按 10min 一次分割，按其他分钟可更改 `-segment_time 600` 为其他数字

合并为同一文件可以先创建一个 `filelist.txt` 文件列出所有片段

```markdown
file 'output_000.wav'
file 'output_001.wav'
file 'output_002.wav'
```

然后使用命令合并

```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy finished.wav
```

关于精准截取一个片段，比如从 10min 开始截取 15min 的话

```bash
ffmpeg -ss 00:10:00 -i input.wav -t 00:15:00 -c copy part1.wav
```

### 其他来源

对于其他来源的 `flac, mp3` 等格式的音乐，可以使用 ffmpeg 转换格式以进行推理

```bash
for %i in (*.flac) do ffmpeg -i "%i" "%~ni.wav"
for %i in (*.mp3) do ffmpeg -i "%i" "%~ni.wav"
```

但就算是从有损格式转换为无损格式，也并不是说歌曲变成无损的了，建议使用直接从实体专辑提取出的 wav 音频

## 提取干声

### 搭建环境

首先安装 MiniConda。创建环境并激活

```bash
conda create -n roformer python=3.12
conda activate roformer 
```

安装 PyTorch

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

安装 [openmirlab/bs-roformer-infer](https://github.com/openmirlab/bs-roformer-infer)

```bash
pip install bs-roformer-infer
```

安装 [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator)

```bash
pip install audio-separator[gpu]
```

### 下载模型

使用命令查看当前可用模型

```bash
bs-roformer-download --list-models
# audio-separator
audio-separator --list_models
```

2026-05-21 时 `bs-roformer-download` 运行输出为

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

这里的模型大概用途如下：

- BS Roformer SW by jarredou: 可以分离出 bass, drums, guitar, instrumental, other, piano, vocals 七种音轨
- BS Roformer | Chorus Male-Female by Sucial: 分离出男声、女声和混响
- BS Roformer | Instrumental Resurrection by unwa: 伴奏超清重构模型，修复老歌的伴奏
- BS Roformer | Male-Female by aufr33: 分离出男声和女声
- BS Roformer | Vocals Resurrection by unwa: 人声超清重构模型，Revive 的激进版本，修复老歌的人声
- BS Roformer | Vocals Revive Series: 人声修复模型，类似画质超分的感觉
- BS Roformer | Vocals by Gabox: 标准人声剥离，对比第一个 SW 的七种轨道，这个是只能分离出伴奏和人声
- BS-Roformer-De-Reverb: 去混响

下载需要的模型，这里下载两个模型，不过因为下载链接失效，其中一个需要另外下载

```bash
bs-roformer-download --model "Roformer Model: BS Roformer SW by jarredou"
# 以下内置下载链接失效
bs-roformer-download --model "Roformer Model: BS-Roformer-De-Reverb"
```

关于去混响模型可以在 <huggingface.co> 找到下载，链接为: [anvuew/dereverb_bs_roformer](https://huggingface.co/anvuew/dereverb_bs_roformer)

下载模型文件和配置文件 `yaml` 并放在对应文件夹下，建议将配置文件 `yaml` 重命名为和模型相同文件名

### 音频处理

这里进行三步处理，首先使用 `BS Roformer SW by jarredou` 进行分离出人声，然后使用 `Roformer Model: MelBand Roformer | Karaoke V2 by Gabox` 分离出和声，最后使用 `Roformer Model: BS-Roformer-De-Reverb` 去混响，从而得到最终的干声

当然第二步和第三步可以调换试一下，说不定效果也会变更好，具体根据音乐不同，最优解不同

首先创建输入输出文件夹，这里有三步，所以创建每一步的输入输出

```bash
mkdir step1_input, step1_outputs, step2_input, step2_outputs, step3_input, step3_outputs
```

在 `step1_input` 放入音乐 (推荐使用英文命名)，注意使用无损 wav 格式

#### <1> 多轨拆分

使用 `BS Roformer SW by jarredou` 进行多轨拆分。修改模型 `yaml` 文件，添加相关配置项 (路径在 `models/roformer-model-bs-roformer-sw-by-jarredou`)

```yaml
inference:
  batch_size: 16
  dim_t: 1101
  chunk_size: 352768
  num_overlap: 8
  normalize: false
```

这些配置项根据设备性能进行调整

- batch_size: 按显存选择，显存越大填越大，比如 16G 显存填写 16
- dim_t: 请勿修改，这是模型训练的时域维度
- chunk_size: 下载的配置缺失该项，按照上例添加并填入 `352768`
- num_overlap: 按显存选择 2-10
- normalize: 保持 false

开始推理

```bash
bs-roformer-infer --config_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.yaml --model_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.ckpt --input_folder ./step1_input --store_dir ./step1_outputs
```

推理完成后将后缀为 `_vocals.wav` 的文件放入第二步输入文件夹 `step2_input`

##### (optional) 与 MSST 混合获取更好的效果

一般情况下单独使用任何一种的效果已经够用，不 过如果追求极致的话，可以使用 MSST-BSRNN 跑一遍得到人声 `vocals_msst.wav`，然后将其和 Roformer 跑出的人声 `vocals_roformer.wav` 进行双轨融合，然后使用该文件进行接下来的步骤，可以直接使用 `ffmpeg` 进行融合

```bash
ffmpeg -i vocals_roformer.wav -i vocals_msst.wav -filter_complex "amix=inputs=2:duration=longest:normalize=0" -c:a pcm_s16le vocals_combined.wav
```

其中部分参数解释

- `normalize=0`: 关闭动态自适应包络，防止声音细节和音量产生突变
- `-c:a pcm_s16le`: 无损输出

#### <2> 人声提纯

提取和声使用的模型因为架构不同需要 `audio-separator`，该工具运行时下载

```bash
audio-separator ./step2_input --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

推理完成后 Vocals 是主唱，Instrumental 为和声，将 Vocals 文件放入第三步的输入文件夹 `step3_input`

#### <3> 空间净化

使用 `BS-Roformer-De-Reverb` 去除人声里的混响，可以调整 `yaml` 配置

```bash
inference:
  batch_size: 16
  dim_t: 876
  num_overlap: 8
```

其中 `dim_t` 不要修改，另外俩项根据显存修改

开始推理

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.yaml --model_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

推理完成后获得后缀为 `_noreverb.wav` 的文件即为干声

##### (optional) 分离男女声

如果有男女合唱的话，可以先使用 `BS Roformer | Chorus Male-Female by Sucial` 将声音分离后提取 (该模型可以去 [Sucial/Chorus_Male_Female_BS_Roformer](https://huggingface.co/Sucial/Chorus_Male_Female_BS_Roformer) 下载)

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.yaml --model_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

## 变声

使用 Applio 进行变声处理 (RVC 架构)

项目地址: [IAHispano/Applio](https://github.com/IAHispano/Applio)

### 安装

安装非常方便，克隆源代码

```bash
git clone https://github.com/IAHispano/Applio.git
```

进入根目录运行 `run-install.bat` 即可开始安装

安装完成后运行 `run-applio.bat` 即可启动

### 训练模型

选择 Training 标签栏，在 Model Settings 新建一个 Model Name

然后在 Preprocess(预处理) 模块新建一个数据集并上传一些干声，上传完成后点击 `Preprocess Dataset`

Extract 模块保持默认即可，点击 `Extract Features`

Training 模块根据显存调整 Batch Size

- 8G: 4 or 8
- 12-16G: 12-16
- 24G-: 24-32

Save Every Epoch 保持默认 10 即可

Total Epoch 推荐 200-300，一般数据集在这个轮数下会比较好 (大概 220-250 是最优模型，具体可从这个地方向上或向下尝试)

调整完成后同意条款，创建索引 (Generate Index) 后开始训练 (Start Training)

### 推理

训练完成模型后变声在 Inference(推理) 标签栏，选择模型，可以先从 200-250 轮的模型测试，然后调高或降低轮数

关于高级选项 (Advanced Settings) 的选项

- Split Audio: 长音频勾选防止现存溢出，歌曲 (3min) 可能不勾选效果更好
- Autotune(自动电音/修音): 唱歌可勾选，独白不勾选
- Clean Audio(音频降噪): 视情况勾选

下方调整栏

- Pitch(音高): 男变女增加 12，女变男减少 12，相同为 0
- Search Feature Ratio(检索特征占比/索引率): 唱歌推荐 0.7-0.8，而播客、长独白等推荐 0.6-0.7
- Protect Voiceless Consonants(保护清辅音和呼吸声): 唱歌可调到 0.33 左右，也可 0.5，其他 0.5

调整完成后同意条款，开始转换 (Convert)

### (optional) 双声道音频推理

Applio 只能输出单声道，所以输入立体声音频的处理效果超级奇怪，这里使用先分离声道，推理，然后再合并

使用 `ffmpeg` 分离声道

```bash
ffmpeg -i input.wav -filter_complex "[0:a]pan=mono|c0=c0[left];[0:a]pan=mono|c0=c1[right]" -map "[left]" left.wav -map "[right]" right.wav
```

分别进行推理后，合并为立体声

```bash
ffmpeg -i left_output.wav -i right_output.wav -filter_complex "[0:a][1:a]join=inputs=2:channel_layout=stereo[a]" -map "[a]" final_stereo.wav
```

### (question) 端口占用问题

如果显示端口被占用的话，打开程序根目录的 `app.py`，修改 `DEFAULT_PORT = 6969` 为其他数值

尽量避开 Windows 预留端口，这些端口通过以下命令在 PowerShell 中查看

```bash
netsh int ipv4 show excludedportrange protocol=tcp
```

##  混音

变声后的干声再和之前 **多轨拆分** 步骤分离的伴奏合并即可

因为将和声分离出来了，可以先试着将第二步的和声与第一步的伴奏混合成为新伴奏，然后使用 `ffmpeg` 将干声和新伴奏混合，命令都是一样的，如下

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex amix=inputs=2:duration=longest output.wav
```

当然纯干声并不是很好听，加点混响效果可能更好

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:40:0.4[v_rev]; [v_rev][1:a]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

其中对于 `aecho=0.8:0.88:40:0.4` 参数解释如下

- `0.8`: In Gain 也就是输入音量，干声进效果器的音量
- `0.88`: Out Gain 也就是输出音量，混响完出来的总音量
- `40`: Delays 延迟时间，声音碰到墙壁回弹
- `0.4`: Decays 衰减系数，让声音有淡淡的尾音延申

这个参数是简易录音室的效果感觉，舞台感使用 `aecho=0.8:0.88:80:0.5`，只是微调可以使用 `aecho=0.8:0.88:35:0.25`

---

上面是均衡混合，可以设置混合为不同的音量

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]volume=1.0[v]; [1:a]volume=0.4[b]; [v][b]amix=inputs=2:duration=longest:dropout_transition=0[a]" -map "[a]" output.wav
```

这里先输入的第一个音频 (干声) 为 100% 音量 `[0:a]volume=1.0[v]` 而第二个音频 (伴奏) 为 40% 音量 `[1:a]volume=0.4[b]`

而混响加调整伴奏的音量的话

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:35:0.25[v_rev]; [1:a]volume=0.8[bgm_v]; [v_rev][bgm_v]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

## 结语

这样无人工干预的效果我尝试了大概三个模型，效果并不是特别理想，对于部分音频还是人工干预进行处理效果会更好

另外这里使用的 `bs-roformer-infer` 稍微有点过时，不仅模型少还多数下载失效。如果允许的话，之后我会尝试使用更新的工具，届时继续发布文章

这篇文章并不完美，但这也算是我学习的记录，博客不就是用来记录这些的嘛
