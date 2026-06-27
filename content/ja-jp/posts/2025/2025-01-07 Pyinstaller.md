---
slug: 213
title: 'Pythonでpyinstallerを使って実行ファイル化する'
# draft: true
author: yexca
date: '2025-01-07T17:26:09+09:00'
categories:
    - 技術学習
tags:
    - Python
    - プログラミング基礎
    - プログラミング言語
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

Python でのパッケージ化は今の OS 環境に依存する。  
Windows なら `.exe`、Linux なら ELF 形式になる。  
クロスプラットフォームの出力は非対応。

## インストール

pip でインストール：

```bat
pip install pyinstaller
~~~

## 単一ファイルとしてビルド

`--onefile` を指定すればOK：

```bat
pyinstaller --onefile main.py
```

## よく使うオプション（Windows 向け）

- `--windowed`: ターミナルを表示しない（GUI アプリ向け）
- `--icon=icon.ico`: アイコン追加
- `--hidden-import`: 必要な依存を手動で指定
- `--add-data`: 追加のリソースファイルを含める
- `--debug`: デバッグ情報を出力

## 複数ファイル構成でビルド

`--onedir` でディレクトリ形式に：

```bash
pyinstaller --onedir main.py
```

この場合、依存ファイルは `_internal` フォルダに入ってて、ちょっと扱いづらい。

pyinstaller 6.1.0 以上なら `--contents-directory` が使える：

```bat
pyinstaller --contents-directory . .\main.py
```

これで依存と実行ファイルが同じフォルダ内にまとまる。

## ファイルの追加（設定ファイルなど）

たとえば `project/conf/settings.json` を一緒に含めたい場合：

まずは複数ファイル形式でビルド：

```bash
pyinstaller --name my_program --contents-directory . .\main.py
```

すると `my_program.spec` ってファイルが生成される。これを編集：

```groovy
datas=[('conf/settings.json', 'conf/')],
```

編集したら、`dist/` フォルダの中を一度消してから（消さなくてもOK）再ビルド：

```bash
pyinstaller my_program.spec
```

## 実際のプロジェクト

この方法で、[このソフト](https://blog.yexca.net/ja/archives/211) を exe にできた  
 ~~（でもまだエラーハンドリング入れてない）~~

## 参考記事

<https://www.cnblogs.com/yqbaowo/p/17863429.html>
