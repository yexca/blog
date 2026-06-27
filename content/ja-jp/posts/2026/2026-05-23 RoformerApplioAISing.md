---
slug: 280
title: 'RoformerとApplioを使ったAIカバー曲の作り方'
# draft: true
author: yexca
date: '2026-05-23T03:00:06+09:00'
lastmod: 2026-05-23T17:50:02+0900
categories:
    - やってみた
tags:
    - Roformer
    - RVC
    - Applio
    - AI
---

{{< notice >}} この記事は gemini-3.5-flash によって翻訳されました {{< /notice >}}

## 音源を手に入れる

トレーニングには、本物の無劣化音源（つまり `pcm_f32le` フォーマットの音声ファイル）を使うのがおすすめ。CDなどの物理アルバムを購入してインポートするのが一番だね。やり方は <https://www.bilibili.com/opus/925630344961458181> を参考にしてみて。ただし、flacには変換せずにそのままwav形式で出力しよう。

この記事ではRVCベースのApplioを使うよ。トレーニングには、良い結果を得るためにだいたい10分〜60分のクリーンなボーカル音源（乾声/ドライバブル）が必要になる。でも、長くても2時間は超えないようにしよう。あと、量より質が大事！「Garbage In, Garbage Out（ゴミを入力してもゴミしか出てこない）」だからね。

### Youtube

YouTubeから音源を取得する方法についてだけど、`yt-dlp` を使ってダウンロードできる。ただ、ここから取得する音源は有劣化フォーマットからの変換になるから、本物の無劣化音源ではないよ。

{{< github repo="yt-dlp/yt-dlp" >}}

最高音質のYouTube動画から音声をダウンロードするコマンド：

```bash
yt-dlp -x --audio-format wav --audio-quality 0 --embed-thumbnail [video_url]
```

もし長めの音声（10分以上）なら、ffmpegを使って分割できるよ。

```bash
ffmpeg -i input.wav -f segment -segment_time 600 -c copy output_%03d.wav
```

> ここでは10分（600秒）ごとに分割しているけど、別の時間にするなら `-segment_time 600` の数値を変更してね。

一つのファイルに結合するには、まず `filelist.txt` を作って、すべてのパーツをリストアップする。

```markdown
file 'output_000.wav'
file 'output_001.wav'
file 'output_002.wav'
```

それから、このコマンドで結合するよ。

```bash
ffmpeg -f concat -safe 0 -i filelist.txt -c copy finished.wav
```

特定の部分だけをきれいに切り出したいとき、例えば10分から始めて15分間分を切り出したい場合はこうする：

```bash
ffmpeg -ss 00:10:00 -i input.wav -t 00:15:00 -c copy part1.wav
```

### その他のソース

他のソースから入手した `flac` や `mp3` などのフォーマットの音楽は、ffmpegを使って推論用にフォーマット変換しよう。

```bash
for %i in (*.flac) do ffmpeg -i "%i" "%~ni.wav"
for %i in (*.mp3) do ffmpeg -i "%i" "%~ni.wav"
```

でも、有劣化フォーマットから無劣化フォーマットに変換したからといって、曲自体がロスレスになるわけじゃない。やっぱり物理アルバムから直接取り出したwav音源を使うのが一番おすすめ。

## ボーカル（乾声）の抽出

### 環境の構築

まずはMiniCondaをインストールしよう。環境を作成してアクティベートするよ。

```bash
conda create -n roformer python=3.12
conda activate roformer 
```

PyTorchのインストール。

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
```

[openmirlab/bs-roformer-infer](https://github.com/openmirlab/bs-roformer-infer) のインストール。

```bash
pip install bs-roformer-infer
```

[nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) のインストール。

```bash
pip install audio-separator[gpu]
```

### モデルのダウンロード

次のコマンドで、現在利用可能なモデルを確認できるよ。

```bash
bs-roformer-download --list-models
# audio-separator
audio-separator --list_models
```

2026年5月21日時点での `bs-roformer-download` の出力はこんな感じ：

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

各モデルの主な用途はこんな感じ：

- BS Roformer SW by jarredou: bass、drums、guitar、instrumental、other、piano、vocalsの7つの音軌（マルチトラック）に分離できる。
- BS Roformer | Chorus Male-Female by Sucial: 男声、女声、そしてコーラスを分離できる。
- BS Roformer | Instrumental Resurrection by unwa: 伴奏用の超高音質再構築モデル。古い曲の伴奏を修復する。
- BS Roformer | Male-Female by aufr33: 男声と女声を分離する。
- BS Roformer | Vocals Resurrection by unwa: ボーカルの超高音質再構築モデル。Reviveのよりアグレッシブなバージョンで、古い曲のボーカルを修復する。
- BS Roformer | Vocals Revive Series: ボーカル修復モデル。画像の「超解像」みたいな感覚。
- BS Roformer | Vocals by Gabox: 標準的なボーカル抽出モデル。最初のSWモデルが7つのトラックに分けるのに対して、これは伴奏とボーカルの2つだけに分離する。
- BS-Roformer-De-Reverb: デリバーブ（残響除去）。

必要なモデルをダウンロードしよう。ここでは2つのモデルをダウンロードするけど、一部ダウンロードリンクが切れているため、片方は別途ダウンロードする必要があるよ。

```bash
bs-roformer-download --model "Roformer Model: BS Roformer SW by jarredou"
# 以下の内蔵ダウンロードリンクは現在失効している
bs-roformer-download --model "Roformer Model: BS-Roformer-De-Reverb"
```

デリバーブ（残響除去）モデルは huggingface.co で見つけることができるよ。リンクはこちら：[anvuew/dereverb_bs_roformer](https://huggingface.co/anvuew/dereverb_bs_roformer)

モデルファイルと設定用の `yaml` ファイルをダウンロードして、対応するフォルダに配置してね。設定ファイルの `yaml` はモデルと同じファイル名にリネームしておくのがおすすめ。

### 音声の処理

ここでは3つのステップで処理を行うよ。まず `BS Roformer SW by jarredou` を使ってボーカルを分離し、次に `Roformer Model: MelBand Roformer | Karaoke V2 by Gabox` でコーラスを分離、最後に `Roformer Model: BS-Roformer-De-Reverb` で残響を除去して、最終的なクリーンなボーカル（乾声）を手に入れる。

もちろん、2番目と3番目のステップは順序を入れ替えて試してみるのもあり。曲によって最適な組み合わせが変わるからね。

まずは入力用と出力用のフォルダを作成しよう。今回は3ステップあるから、それぞれのステップ用のフォルダを用意するよ。

```bash
mkdir step1_input, step1_outputs, step2_input, step2_outputs, step3_input, step3_outputs
```

`step1_input` に音楽ファイルを入れよう（ファイル名は英語推奨）。必ず無劣化ファイルのwav形式を使ってね。

#### <1> マルチトラック分離

`BS Roformer SW by jarredou` を使ってマルチトラックに分解する。モデルの `yaml` ファイルを編集して、関連する設定を追加してね（パスは `models/roformer-model-bs-roformer-sw-by-jarredou`）。

```yaml
inference:
  batch_size: 16
  dim_t: 1101
  chunk_size: 352768
  num_overlap: 8
  normalize: false
```

これらの設定項目はマシンのスペックに合わせて調整してね。

- batch_size: VRAM（ビデオメモリ）の容量に合わせて選ぶ。メモリが多いほど数値を大きくできる。例えば16GBのVRAMなら16に設定する。
- dim_t: 変更しないでね。これはモデル訓練時の時間領域の次元数だよ。
- chunk_size: ダウンロードした設定にこの項目がない場合があるので、上の例のように `352768` を追加して入力してね。
- num_overlap: VRAMの容量に合わせて2〜10の間で選ぶ。
- normalize: falseのままにしておく。

推論を開始しよう：

```bash
bs-roformer-infer --config_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.yaml --model_path models/roformer-model-bs-roformer-sw-by-jarredou/BS-Rofo-SW-Fixed.ckpt --input_folder ./step1_input --store_dir ./step1_outputs
```

推論が終わったら、ファイル名が `_vocals.wav` で終わるファイルを2番目のステップの入力フォルダ `step2_input` に移動させてね。

##### (optional) MSSTとブレンドしてクオリティをさらに上げる

普通はどれか一つだけでも十分な効果が得られるけど、究極のクオリティを目指すなら、MSST-BSRNNを一度走らせてボーカル音源 `vocals_msst.wav` を作り、それをRoformerで出力した `vocals_roformer.wav` とステレオで融合（ブレンド）させる方法がある。このブレンドしたファイルを使って次のステップに進むんだ。融合には `ffmpeg` が直接使えるよ。

```bash
ffmpeg -i vocals_roformer.wav -i vocals_msst.wav -filter_complex "amix=inputs=2:duration=longest:normalize=0" -c:a pcm_s16le vocals_combined.wav
```

パラメータの簡単な説明：

- `normalize=0`: 音声のディテールや音量が急激に変化するのを防ぐため、動的オートボリューム調整をオフにする。
- `-c:a pcm_s16le`: ロスレス（無劣化）出力。

#### <2> ボーカルの抽出・純化

コーラスを分離するためのモデルは、アーキテクチャが異なるため `audio-separator` を使う。このツールを実行すると自動でダウンロードされるよ。

```bash
audio-separator ./step2_input --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

推論が終わると、`Vocals` がメインボーカル、`Instrumental` がコーラス（ハモリ）になる。`Vocals` ファイルを3番目の入力フォルダ `step3_input` に入れよう。

#### <3> 空間のクレンジング（デリバーブ）

`BS-Roformer-De-Reverb` を使ってボーカルの残響（リバーブ）を取り除くよ。`yaml` の設定を調整できる。

```bash
inference:
  batch_size: 16
  dim_t: 876
  num_overlap: 8
```

`dim_t` は変更せず、他の2つの項目はVRAMに合わせて変更してね。

推論を開始：

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.yaml --model_path ./models/roformer-model-bs-roformer-de-reverb/dereverb_bs_roformer_anvuew_sdr_22.5050.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

推論が終わると、`_noreverb.wav` という名前のファイルができあがる。これが最終的なクリーンなボーカル音源（乾声）だよ。

##### (optional) 男声と女声を分離する

もし男女のデュエット曲なら、先に `BS Roformer | Chorus Male-Female by Sucial` を使って声を分離してから抽出するといいよ（このモデルは [Sucial/Chorus_Male_Female_BS_Roformer](https://huggingface.co/Sucial/Chorus_Male_Female_BS_Roformer) からダウンロードできる）。

```bash
bs-roformer-infer --config_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.yaml --model_path ./models/roformer-model-bs-roformer-chorus-male-female-by-sucial/model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt --input_folder ./step3_input --store_dir ./step3_outputs
```

## ボイスチェンジ（変声）

Applio（RVCアーキテクチャ）を使ってボイスチェンジ処理を行うよ。

プロジェクトのURL: [IAHispano/Applio](https://github.com/IAHispano/Applio)

### インストール

インストールはすごく簡単。ソースコードをクローンしよう。

```bash
git clone https://github.com/IAHispano/Applio.git
```

ルートディレクトリに移動して `run-install.bat` を実行すれば、インストールが始まるよ。

インストールが終わったら、`run-applio.bat` を実行して起動しよう。

### モデルのトレーニング

「Training」タブを選んで、Model Settingsで新しい「Model Name」を作成する。

次に「Preprocess（前処理）」モジュールで新しいデータセットを作成し、いくつかのクリーンなボーカル音源（乾声）をアップロードする。アップロードが終わったら `Preprocess Dataset` をクリックしよう。

「Extract」モジュールはデフォルトのままでOK。`Extract Features` をクリック。

「Training」モジュールでは、VRAMの容量に合わせてBatch Sizeを調整してね。

- 8G: 4 または 8
- 12-16G: 12-16
- 24G-: 24-32

「Save Every Epoch」はデフォルトの10のままで大丈夫。

「Total Epoch」は200〜300がおすすめ。一般的なデータセットなら、このくらいのエポック数で良い結果が出るよ（だいたい220〜250エポックあたりが一番良いモデルになることが多い。ここを基準に増やしたり減らしたりしてみてね）。

調整が終わったら規約に同意して、トレーニングを開始（Start Training）しよう。その後、インデックスを作成（Generate Index）しよう。

### 推論（ボイスチェンジの適用）

モデルのトレーニングが終わったら、「Inference（推論）」タブでボイスチェンジを行うよ。モデルを選択しよう。まずは200〜250エポックのモデルでテストしてみて、それから必要に応じてエポック数を上げ下げするのがいいね。

「Advanced Settings（詳細設定）」の各オプションについて：

- Split Audio: 音声ファイルを分割する設定。長い音声の場合はVRAM溢れを防ぐためにチェックを入れる。3分程度の短い曲なら、チェックを外したほうがクオリティが高くなるかも。
- Autotune(自动电音/修音): オートチューン（自動ピッチ補正/ケロケロ）。歌の場合はチェックを入れて、語りや独り言の場合は外しておこう。
- Clean Audio(音频降噪): ノイズ除去。状況に合わせてチェックを入れてね。

その下の調整スライダー：

- Pitch(音高): キー調整。男声を女声にするなら +12、女声を男声にするなら -12、同じなら 0 に。
- Search Feature Ratio(检索特征占比/索引率): 特徴量検索比率（インデックス比率）。歌なら0.7〜0.8、ポッドキャストや長い語りなら0.6〜0.7がおすすめ。
- Protect Voiceless Consonants(保护清辅音和呼吸声): 無声音やブレス音の保護。歌なら0.33前後か0.5、その他なら0.5で調整してみて。

調整が終わったら規約に同意して、変換（Convert）を開始しよう。

### (オプション) ステレオ音声での推論

Applioはモノラル出力しかできないから、ステレオ音声を入力すると仕上がりがすごく不自然になっちゃうんだ。だから、まずはチャンネルを分離してから推論して、そのあと再度結合する方法をとるよ。

`ffmpeg` を使ってチャンネルを分離する。

```bash
ffmpeg -i input.wav -filter_complex "[0:a]pan=mono|c0=c0[left];[0:a]pan=mono|c0=c1[right]" -map "[left]" left.wav -map "[right]" right.wav
```

それぞれ個別に推論したあと、ステレオに再結合する。

```bash
ffmpeg -i left_output.wav -i right_output.wav -filter_complex "[0:a][1:a]join=inputs=2:channel_layout=stereo[a]" -map "[a]" final_stereo.wav
```

### (よくある質問) ポート競合問題

もしポートが使用中（占有）と表示された場合は、プログラムのルートディレクトリにある `app.py` を開いて、`DEFAULT_PORT = 6969` を別の数値に変更しよう。

Windowsの予約済みポートは避けるようにしてね。これらはPowerShellで次のコマンドを実行すると確認できるよ。

```bash
netsh int ipv4 show excludedportrange protocol=tcp
```

## ミキシング

ボイスチェンジしたボーカル音源と、最初の **マルチトラック分離** ステップで分けた伴奏（インスト）を合わせれば完成だよ。

コーラスを分離してあるから、まずは2番目のステップで分けたコーラスと最初のステップの伴奏をミックスして「新しい伴奏」を作り、その後に `ffmpeg` でボーカルと新しい伴奏をミックスしてみるのもおすすめ。コマンドは同じで、以下のようになる：

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex amix=inputs=2:duration=longest output.wav
```

もちろん、完全にクリーンなボーカル（ドライ音）のままだと少し物足りないから、リバーブ（エコー）を少し加えるとより良くなるよ。

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:40:0.4[v_rev]; [v_rev][1:a]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

`aecho=0.8:0.88:40:0.4` のパラメータの意味はこんな感じ：

- `0.8`: In Gain。入力音量、つまりエフェクターに入る前のボーカルの音量。
- `0.88`: Out Gain。出力音量、リバーブがかかった後の全体の音量。
- `40`: Delays。遅延時間。音が壁に反射して返ってくるまでの時間だね。
- `0.4`: Decays。減衰係数。音に心地よい余韻（残響の消え方）を持たせる設定。

この設定は「シンプルな簡易スタジオ」のような響きになるよ。もっとステージっぽい広い感じにしたいなら `aecho=0.8:0.88:80:0.5` に、ほんの少し微調整するくらいなら `aecho=0.8:0.88:35:0.25` を使ってみてね。

---

上の例は均等なミックスだけど、それぞれの音量を別々に調整してミックスすることもできるよ。

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]volume=1.0[v]; [1:a]volume=0.4[b]; [v][b]amix=inputs=2:duration=longest:dropout_transition=0[a]" -map "[a]" output.wav
```

ここでは最初に入力した音声（ボーカル）を100%の音量 `[0:a]volume=1.0[v]`、2番目の音声（伴奏）を40%の音量 `[1:a]volume=0.4[b]` に設定しているよ。

リバーブをかけつつ、伴奏の音量も調整したい場合はこうなる：

```bash
ffmpeg -i vocal.wav -i instrumental.wav -filter_complex "[0:a]aecho=0.8:0.88:35:0.25[v_rev]; [1:a]volume=0.8[bgm_v]; [v_rev][bgm_v]amix=inputs=2:duration=longest:normalize=1" -c:a pcm_s16le output.wav
```

## おわりに

こういう「完全自動（手動の調整なし）」での処理は、だいたい3つくらいのモデルで試してみたんだけど、正直そこまで完璧な結果にはならなかった。やっぱり一部の音源については、少し手作業で手を入れて調整してあげたほうがクオリティは上がると思う。

あと、ここで紹介した `bs-roformer-infer` は少し古いツールだから、モデルが少なかったり、リンク切れでダウンロードできなかったりすることが多いんだ。もしタイミングがあれば、今度はもっと新しいツールを試してみて、また記事にまとめて公開するね。

今回の記事は決して完璧なものではないけれど、自分の勉強の記録として残しておくよ。ブログってそもそもこういうのを書き残しておくための場所だしね！