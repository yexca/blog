---
slug: 5
title: VsCode 配置 Python 環境
date: '2021-11-07T11:28:58+08:00'
author: yexca
# layout: post
# permalink: /archives/5
views:
    - '242'
categories:
    - 技術學習
tags:
    - Python
    - 'VS Code'
---

> 該文章使用 Google 翻譯處理。

## 正文

安裝完成 VS Code 和 Python 並配置環境變量後

開啟 VS Code，進入拓展搜尋並下載 Python

在資源管理器新建一個 Python 原始檔 (.py) 後，資源管理器會在.vscode 資料夾下產生 setting.json 檔案（若沒有自動產生可自行建立）

開啟 setting.json 文件，並替換為以下程式碼

```json
{
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Args": ["--max-line-length=248"],
    "python.linting.pylintEnabled": false

}
```

此時回到 python 文件，VS Code 右下會彈出警告，點擊下載

按 `CTRL+SHIFT+P` 鍵，輸入 `Python: Select Interpreter` (即 Python：選擇編譯器)

然後選擇您下載的編譯器即可

如果 .vscode 資料夾下有 launch.json 文件，需要在該文件的 `configurations` 中加入以下程式碼

```json
{
            "name": "Python: 目前文件",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal"
        }
```

## 參考文章

[VsCode 配置 Python 環境小白教程](https://blog.csdn.net/Amoduo1/article/details/111246209)

[VSCode 配置 Python 教程](https://blog.csdn.net/Zhangguohao666/article/details/105040139)
