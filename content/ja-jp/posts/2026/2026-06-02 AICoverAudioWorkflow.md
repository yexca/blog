---
slug: 283
title: 'AIカバーの学習用音声の前処理について考えてみる'
# draft: true
author: yexca
date: '2026-06-02T17:23:44+09:00'
categories:
    - 試行錯誤の記録
tags:
    - Roformer
    - AI
    - 音楽
---

{{< notice >}} この記事は gemini-3.5-flash によって翻訳されました {{< /notice >}}

今の技術だと、完全にAIだけでボーカル（アカペラ）を抽出するのはまだちょっと現実的じゃない。多くの場合、手動での修正が必要になる。でも、データ量さえ十分に大きければ、AIでボーカルを抽出した後に学習に適したオーディオをなんとか集めることができるよ。

この記事では、素人であるボクが完全にAIを使って学習用オーディオを選別するワークフローを紹介するよ。すべてオープンソースのソフトウェアを使っている。

## 学習用と推論用のオーディオ

AIカバー用のオーディオについて、最近の自分の研究をまとめると、大体「学習は音質に厳しく、推論はピッチ（音高）に厳しい」って言える。

つまり、学習用のオーディオと推論用のオーディオは分けて考えるべきなんだ。

推論用のオーディオで重要なのはピッチ。つまり、コーラス（ハモリ）の処理がうまくできていればOKで、ケロケロボイス（オートチューン）があるかどうかは二の次。

でも、学習用のオーディオとなると、ほぼ完璧なクオリティのものを使う必要があるんだ。

## 音質

まずはできるだけ高音質なオーディオを選びたい。ベストなのはロスレスの音源だけど、処理しやすい（背景ノイズが処理しやすい）オーディオを選ぶ方が、結果的により良い効果が得られるかもしれない。

具体的な音質については、[alexkay/spek](https://github.com/alexkay/spek) というソフトを使って確認できるよ。

注意点：不可逆圧縮（有損）の音源をロスレス（無損）形式に変換しても音質は上がらない。実際にソフトで見れば一目瞭然だよ。

## ピッチ（音高）

学習用のオーディオは、できるだけ幅広いピッチ範囲をカバーしているのが理想的。一般的に、普通の話し声だとこんな感じ：

- 男性: 85Hz - 180Hz
- 女性: 165Hz - 255Hz

歌う場合なら、理論上は E2 (82Hz) から C5 (523Hz) までをカバーするのがおすすめ。もちろん、ファルセット（裏声）が必要なら、上限を800Hzまで引き上げてもいいね。

もし可能なら、「あー」「うー」といったロングトーンの音声を使うと、モデルに最も完全なF0（基本周波数）の連続的な特徴を提供できることが多い。

最近の主流なAIカバーモデルはピッチ抽出にRMVPEアルゴリズムを使っていて、理論的にはそっちの方が効果的。でも、`praat` を使って大体のピッチの目安をサクッと確認することもできる。まずは依存ライブラリをインストールしよう。

```bash
pip install praat-parselmouth numpy matplotlib
```

それから、`pitch.py` というファイルを作成して、以下の内容を入力してね。

```python
import os
import glob
import numpy as np
import parselmouth
import matplotlib.pyplot as plt

def analyze_dataset_pitch(directory=".", outlier_percentile=1.0):
    """
    ディレクトリ内のオーディオファイルをスキャンし、Praatを使ってピッチフレームを抽出。
    すべての有効なF0データを集計し、統計的な外れ値を除外して
    実際の有効なピッチ範囲を見つける。
    """
    audio_formats = ('*.wav', '*.flac', '*.ogg', '*.mp3')
    audio_files = []
    for ext in audio_formats:
        audio_files.extend(glob.glob(os.path.join(directory, ext)))
    
    if not audio_files:
        print(f"[Error] サポートされているオーディオファイルがディレクトリ内に見つかりません: '{directory}'")
        return

    print(f"[Info] {len(audio_files)} 個のオーディオファイルが見つかりました。PraatによるF0抽出を開始します...")
    print("-" * 65)

    all_pitch_frames = []

    for file_path in audio_files:
        file_name = os.path.basename(file_path)
        try:
            # Praatエンジンにオーディオをロード
            snd = parselmouth.Sound(file_path)
            pitch = snd.to_pitch()
            pitch_values = pitch.selected_array['frequency']
            
            # 有声音フレームのみをフィルタリング（Praatは無音/无声音に0を割り当てる）
            voiced_frames = pitch_values[pitch_values > 0]
            
            if len(voiced_frames) == 0:
                print(f" File: {file_name[:25]:<25} | 有効な有声音が検出されませんでした。")
                continue
            
            # データセット全体の分布分析のためにグローバルプールに追加
            all_pitch_frames.extend(voiced_frames)
            
            file_min = np.min(voiced_frames)
            file_max = np.max(voiced_frames)
            print(f" File: {file_name[:25]:<25} | 範囲: {file_min:.1f} Hz - {file_max:.1f} Hz")

        except Exception as e:
            print(f"[Warning] {file_name} の処理に失敗しました: {e}")

    print("-" * 65)
    
    if not all_pitch_frames:
        print("[Error] 集計されたピッチデータが空です。")
        return

    # グローバルプールをnumpy配列に変換
    all_pitch_frames = np.array(all_pitch_frames)

    # 1. 絶対範囲（ノイズに弱い）
    abs_min = np.min(all_pitch_frames)
    abs_max = np.max(all_pitch_frames)

    # 2. パーセンタイルを使用した堅牢な範囲（極端な端をカット）
    # 例：outlier_percentile=1.0の場合、1〜99パーセンタイルを取得
    lower_bound = np.percentile(all_pitch_frames, outlier_percentile)
    upper_bound = np.percentile(all_pitch_frames, 100.0 - outlier_percentile)

    # 3. 最頻値/ピーク分析（声が実際に集中している場所）
    # ヒストグラムに基づく簡易的な密度ピーク推定を使用
    counts, bin_edges = np.histogram(all_pitch_frames, bins=50)
    primary_peak_index = np.argmax(counts)
    primary_peak_hz = (bin_edges[primary_peak_index] + bin_edges[primary_peak_index + 1]) / 2

    # 包括的な統計サマリーを出力
    print("\n" + "="*25 + " 最終ピッチプロファイル " + "="*25)
    print(f" 分析された総有声音フレーム数 : {len(all_pitch_frames)}")
    print(f" 絶対生データ範囲             : {abs_min:.1f} Hz から {abs_max:.1f} Hz (異常値含む)")
    print(f" 主要ピッチ集中帯             : ~{primary_peak_hz:.1f} Hz (最も頻度の高いピッチ)")
    print(f" 有効なRVCターゲット範囲      : {lower_bound:.1f} Hz から {upper_bound:.1f} Hz (上下1%の外れ値をカット)")
    print("=" * 71)

    # オプション：視覚的な分布確認（マルチクラスターのギャップを特定するための分布図を保存）
    try:
        plt.figure(figsize=(10, 5))
        plt.hist(all_pitch_frames, bins=100, density=True, alpha=0.6, color='skyblue', label='ピッチ密度')
        plt.axvline(lower_bound, color='red', linestyle='--', label=f'有効最小値 ({lower_bound:.1f} Hz)')
        plt.axvline(upper_bound, color='red', linestyle='--', label=f'有効最大値 ({upper_bound:.1f} Hz)')
        plt.title('データセットのピッチ分布と有効境界の特定')
        plt.xlabel('周波数 (Hz)')
        plt.ylabel('密度')
        plt.legend()
        plt.grid(axis='x', alpha=0.3)
        
        plot_filename = "dataset_pitch_distribution.png"
        plt.savefig(plot_filename)
        print(f"[Info] 分布図が '{plot_filename}' として正常に保存されました")
    except Exception as e:
        print(f"[Warning] 視覚化グラフを生成できませんでした: {e}")

if __name__ == "__main__":
    # 現在の作業ディレクトリを分析
    analyze_dataset_pitch(directory="./audio", outlier_percentile=1.0)
```

このプログラムは、現在のディレクトリにある `audio` フォルダ内のすべてのオーディオファイルのピッチを読み取って、ターミナルにサマリーを出力し、さらに現在のディレクトリにピッチのグラフを描画してくれるよ。

すべてのオーディオファイルを `audio` フォルダに入れたら、以下のコマンドを実行してピッチを確認しよう。

```bash
python pitch.py
```

## ボーカル（アカペラ）抽出

使用する [nomadkaraoke/python-audio-separator](https://github.com/nomadkaraoke/python-audio-separator) を使うと、かなり多くのモデルを実行できるよ。

GPU版のインストール：

```bash
pip install audio-separator[gpu]
```

モデルの一覧確認：

```bash
audio-separator --list_models
# filter
audio-separator -l --list_filter=vocals --list_limit=5
```

現在、効果が比較的高いのは大体 MelBand Roformer モデル。このモデルは `audio-separator` では MDXC アーキテクチャに属していて、このアーキテクチャにはいくつか共通して使えるパラメータがあるんだ。

- `--mdxc_segment_size=512`: セグメントサイズ。値が大きいほどモデルのコンテキスト理解力が向上し、理論的には効果が良くなる。
- `--mdxc_override_model_segment_size`: セグメントサイズを強制的に変更し、モデルのデフォルト値を上書きする。
- `--mdxc_overlap=8`: 予測ウィンドウ間のオーバーラップ回数。範囲は 2〜50 で、理論上は高いほど滑らかな結果になる。
- `--mdxc_batch_size=4`: 同時に処理する数。VRAM（ビデオメモリ）の容量に合わせて調整してね。
- `--mdxc_pitch_shift=0`: ピッチシフト（キー変更）調整。通常はデフォルトの 0 のままでOK。

ちなみに、めちゃくちゃ長いオーディオを処理するときは、いくつかのチャンクに分割して処理した方が速度が速くなることが多いよ。

```bash
# Process an 8-hour podcast in 10-minute chunks
audio-separator long_podcast.wav --chunk_duration 600
```

じゃあ、モデルはどうやって選べばいいんだろう？ここでは [AliceNavigator/Music-Source-Separation-Training-GUI](https://github.com/AliceNavigator/Music-Source-Separation-Training-GUI) を参考にして、モデルを「伴奏除去（ボーカル抽出）」「コーラス除去」「リバーブ除去」そして「その他（ノイズ除去やブレス・クリックノイズ除去など）」の4つのカテゴリに分けてみるよ。

具体的なモデル選びは、モデルのSDR値（信号対雑音比）を参考にするといい。理論上は高ければ高いほど効果が良い。いくつかおすすめ of モデルを紹介するね。

### 伴奏除去

ボーカルを抽出する場合、一般的には「Roformer Model: MelBand Roformer Kim | FT 3 by unwa」が優秀だよ。具体的な使い方は以下の通り：

```bash
audio-separator ./step1_inputs --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs

# パラメータを調整する場合
audio-separator ./step1_input --model_filename mel_band_roformer_kim_ft3_unwa.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step1_outputs --mdxc_segment_size=512 --mdxc_overlap=8 --mdxc_batch_size=8
```

処理が終わると、ファイル名に `vocals` と付いたものが抽出されたボーカルになる。これを次のステップの処理に回そう。

### コーラス（ハモリ）除去

曲によっては2人以上の歌声が入っていることがあるよね。その場合はコーラス除去モデルを使って、メインボーカルの歌声だけを取り出す必要がある。一般的には「Karaoke」モデルシリーズを使うと良くて、例えば「Roformer Model: MelBand Roformer | Karaoke V2 by Gabox」がおすすめ。使い方はこちら：

```bash
audio-separator ./step2_inputs --model_filename mel_band_roformer_karaoke_gabox_v2.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step2_outputs
```

処理が終わったら、`vocals` と付いているものがメインボーカルの音声だから、これを次のステップに進めてね。

あと、もし男女のダブルメインボーカルなら、「Roformer Model: BS Roformer | Chorus Male-Female by Sucial」というモデルを試してみるのもあり。モデルファイル名は `model_chorus_bs_roformer_ep_267_sdr_24.1275.ckpt` だよ。

### リバーブ（残響）除去

もしカバー曲を作るのが目的なら、「Roformer Model: MelBand Roformer | De-Reverb by anvuew」が使える。

でも、モデルの学習（トレーニング）用なら、モノラル版の「Roformer Model: MelBand Roformer | De-Reverb Mono by anvuew」を使うのがおすすめ。

なぜかというと、現在のAIモデルは学習時に一律モノラルオーディオを採用しているからなんだ。もしステレオ（2チャンネル）を入力すると、左右の位相差のせいで学習時にノイズが入り込んでしまう可能性があるからなんだよね。

```bash
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_anvuew_sdr_19.1729.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs

# モノラル版
audio-separator ./step3_inputs --model_filename dereverb_mel_band_roformer_mono_anvuew.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step3_outputs
```

`noreverb` と付いているファイルが、リバーブが除去された音声だよ。

### その他のモデル

例えばノイズ除去モデルなら、「Roformer Model: Mel-Roformer-Denoise-Aufr33」を使ってマイクのノイズや環境の底ノイズ（ホワイトノイズなど）を消すことができる。

```bash
audio-separator ./step4_inputs --model_filename denoise_mel_band_roformer_aufr33_sdr_27.9959.ckpt --model_file_dir ./models/audio-separator-models --output_format WAV --output_dir ./step4_outputs
```

他には、ブレスや気泡音（アスピレーション）を除去するモデル「Roformer Model: MelBand Roformer | Aspiration by Sucial」なんかもある。モデルファイルは `aspiration_mel_band_roformer_sdr_18.9845.ckpt`。

### その他のアーキテクチャ

ノイズ除去に関して言うと、音楽以外の音声（喋り声など）なら `DeepFilterNet3` というモデルも効果的かもしれない。手軽に使えるのが [Shuichi346/DeepFilterNet3-VST3](https://github.com/Shuichi346/DeepFilterNet3-VST3)。これはDAW用のプラグインなので、使うにはDAWをインストールする必要がある。あと、作者はMacOS版しか配布していないので、他のOS（Windowsなど）を使う場合は自分でビルドする必要があるよ。

DAWについてだけど、[REAPER](https://www.reaper.fm/) がおすすめ。このソフトは公式で無制限の評価利用ができるので、実質無料で使えるんだ。

VST3プラグインをビルドするには、まずRustをインストールする必要がある。[Rustup-init](https://rustup.rs/) をダウンロードして実行し、選択肢が出たら `1` を選んでデフォルトのまま進めればOK。途中でVisual Studioのダウンロードを求められるけど、オプションは変更せずにそのまま全部ダウンロードしちゃって大丈夫。

ダウンロードが終わったら、ローカルにプロジェクトをクローンしてディレクトリに移動しよう。

```bash
git clone https://github.com/Shuichi346/DeepFilterNet3-VST3.git
cd DeepFilterNet3-VST3
```

ビルドの開始：

```bash
cargo xtask bundle deepfilter-vst --release
```

ビルドが完了したら、`target` フォルダ内を何階層か潜って `deepfilter-vst.vst3` ファイルを見つけ、それを `C:\Program Files\Common Files\VST3` フォルダにコピーしてね。

REAPERを開いて、オーディオファイルをドラッグ＆ドロップし、左側の「FX」ボタンをクリックして検索・追加すれば使えるようになる。

個人的には、実際に使ってみた感じだとそこまで効果が良いとは思えなかった（必要な音まで消えちゃうことが多い）。まあ、試してみる価値はあるかもね。

## 音声のノーマライズ（規格化）

モデル学習に使う音声の最大ピーク音量は、-3dB から -6dB の間に収めるのがベスト。高すぎると音割れの原因になっちゃう。

逆に、-40dB以下の部分は次のステップの「スライス（切り出し）」でカットされてしまう。だから、この段階でオーディオの最高音量を -3dB にノーマライズしておくのがおすすめ。

依存パッケージのインストール：

```bash
pip install ffmpeg-normalize
```

以下のコマンドを使うと、現在のディレクトリにあるすべての `.wav` ファイルが処理され、ノーマライズされたファイルが `normalized` フォルダに保存されるよ。事前に `normalized` フォルダを作成しておくのを忘れないでね。

```bash 
ffmpeg-normalize *.wav -nt peak -t -3 -ext wav -o normalized/
```

コマンドの簡単な解説はこんな感じ：

- `-nt peak`: `nt` は Normalization Type（ノーマライズの種類）のことで、ここではピーク値を指定している。
- `-t -3`: ターゲット値を -3dB に設定。
- `-ext wav`: 出力フォーマットを `wav` に指定。
- `-o`: 出力先フォルダ。

これで、学習に使うすべてのオーディオの最大音量が -3dB に均一化されるよ。

## スライス（分割）

[flutydeer/audio-slicer](https://github.com/flutydeer/audio-slicer) を使うと、オーディオを自動的に分割できる。その中から聴いてみて自然なオーディオを選んでいこう。

モデル学習用に、聴き心地の良いクリーンなテイクを選び出そう。各クリップは短くても2秒以上、できれば4秒以上あるのがベスト。

合計時間は大体10分〜30分もあれば十分。最大でも2時間を超えないようにしよう。選別が終わったら、PowerShell環境で以下のコマンドを実行して、現在のすべての `.wav` ファイルの合計時間を確認できるよ。

```powershell
$totalSeconds = Get-ChildItem -Recurse -Filter *.wav | ForEach-Object { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $_.FullName } | Measure-Object -Sum | Select-Object -ExpandProperty Sum; [Timespan]::FromSeconds($totalSeconds) | ForEach-Object { "{0} h {1} m {2} s" -f [Math]::Floor($_.TotalHours), $_.Minutes, $_.Seconds }
```


## 選別（クリーニング）

分割されたオーディオから、ロボットボイスのような機械音を排除し、自然な声のテイクだけを残す。[foobar2000](https://www.foobar2000.org/) というソフトを使うと、余計なリバーブなどを一切通さずに再生できるから、ボクたちが聴いている音がそのまま「モデルが実際に聴く音」になるんだ。

ダウンロードしてインストールしたら、レイアウト（Main Layout）を設定しよう。できるだけプレイリストが大きく表示されるもの（例えば `Slim View + Tabs` など）を選ぶのがおすすめ。

- 出力デバイスの選択

`Ctrl+P` を押して設定画面を開き、`Playback` -> `Output` の `Device` で `exclusive`（排他モード）と書かれているデバイスを選択する。

- 素早く削除するためのショートカットキーを設定

設定画面の `Keyboard Shortcuts` で新しいショートカットを追加する。`Action` のところで `delete` を検索し、`[context]->File Operations->Delete file(s)` を選択する。そして `Key` のところでキー（例えば `Ctrl+D`）を登録する。

設定が終わったら、すべてのオーディオをプレイリストにドラッグ＆ドロップして、再生しながら選別を開始しよう。

## あとがき（感想）

今のAIの実力を見る限り、まだ当分は「仕事を奪われる」なんて心配はしなくてよさそう。少なくともオーディオの分野においては、AIはまだ「便利なツール」の段階に留まっている。作業効率を上げるのには役立つけど、ボクみたいな完全な素人がツールを使っただけでいきなり完璧な作品を作れるわけじゃないからね。

技術はどんどん進化していくだろうけど、やっぱり従来のツールを使った経験がある人の価値は、そう簡単には他で代用できないものだと思うな。