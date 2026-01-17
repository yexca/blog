---
slug: 5
title: VsCode で Python 環境を設定する
date: '2021-11-07T11:28:58+08:00'
author: yexca
# layout: post
# permalink: /archives/5
views:
    - '242'
categories:
    - 技術学習
tags:
    - Python
    - 'VS Code'
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## 本文

VS CodeとPythonのインストールと環境変数の設定が終わったら、

VS Codeを開いて、拡張機能でPythonを検索してダウンロードしてね。

エクスプローラーでPythonのソースファイル（.py）を新しく作ると、.vscodeフォルダの下にsetting.jsonファイルが生成されるよ（自動で生成されなかったら自分で作っても大丈夫）。

setting.jsonファイルを開いて、以下のコードに置き換えてね。

```json
{
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Args": ["--max-line-length=248"],
    "python.linting.pylintEnabled": false

}
```

ここでPythonファイルに戻ると、VS Codeの右下に警告が出るから、ダウンロードをクリックしてね。

`CTRL+SHIFT+P`を押して、「`Python: Select Interpreter`」（つまりPython：インタープリターを選択）って入力するんだ。

そしたら、ダウンロードしたインタープリターを選べばOK。

もし`.vscode`フォルダの下に`launch.json`ファイルがある場合は、そのファイルの`configurations`に以下のコードを追加する必要があるよ。

```json
{
            "name": "Python: 現在のファイル",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal"
        }
```

## 参考記事

[VsCode Python環境設定初心者向けチュートリアル](https://blog.csdn.net/Amoduo1/article/details/111246209)

[VSCode Python設定チュートリアル](https://blog.csdn.net/Zhangguohao666/article/details/105040139)
