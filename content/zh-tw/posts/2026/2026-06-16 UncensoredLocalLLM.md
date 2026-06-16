---
slug: 286
title: '部署本機無審查 AI 模型：打破大型模型的兩層枷鎖'
# draft: true
author: yexca
date: '2026-06-16T13:07:08+09:00'
categories:
    - 折騰經驗
tags:
    - LLM
    - AI
    - Ollama
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

我之前以為本機部署的模型是可以暢所欲言的，但是實際體驗後才意識到現在 AI 模型有兩層枷鎖，一層是雲端提供商的外置過濾器，另一層則是模型在安全對齊（Alignment）訓練時，就已經深深寫入權重的「拒絕神經元」，所以要想獲得完美的體驗，還是需要進行無審查模型的部署。

## 警告

無審查版本一般完全移除了安全護欄，它會毫無保留地執行任何指令。必須注意的是，多模態模型（VLM）在解析本機帶有惡意混淆或提示詞注入（Prompt Injection）的圖片時，更容易被徹底帶偏。

請僅將其用於合法的研究、學術分析、角色扮演或創意寫作，切勿用於生成和傳播違法或有害內容。在為本機 AI 賦予系統或自動化權限時請保持謹慎，善用像是 zeroclaw 類似的零信任機制保障本機設備安全。

## 什麼是無審查模型

在開源社群中，無審查模型通常有以下幾種標籤，它們的製作原理和側重點各有不同：

- `abliterated`：特指透過數學方法精準切除了「拒絕神經元」的模型，特點是去除了說教和拒絕，但完全保留了模型原有的智商。
- `uncensored`：傳統的無審查版，通常在微調階段清洗掉了帶有拒絕回答的資料集。
- `dolphin`：Eric Hartford 團隊專門製作的無審查資料集訓練出的模型系列，非常聽話，適合各種角色扮演或創意寫作。

## 如何獲取與部署

由於合規原因，Ollama 官方模型庫（Library）預設不提供這些變體，我們需要透過社群管道來拉取。

### 方法一：從 Ollama 社群第三方倉庫直接拉取

最簡單的方法是直接執行社群使用者上傳的公開版本。例如，官方標準的 14B 模型會頻繁說教：

```bash
ollama run deepseek-r1:14b
```

而我們可以直接拉取社群中經過特殊處理的同規模無審查版本：


```bash
ollama run huihui_ai/deepseek-r1-abliterated:14b
```

### 方法二：利用 Hugging Face 連結直接執行

Ollama 現在的較新版本支援直接透過 [Hugging Face](https://hf.co) 的 GGUF 倉庫連結進行遠端拉取和執行，省去了自己打包的麻煩：

```bash
# 格式：ollama run hf.co/使用者名稱/倉庫名:量化標籤
ollama run hf.co/llmfan46/gemma-4-31B-it-uncensored-heretic-GGUF:Q4_K_M
```

### 方法三：下載 GGUF 純手工打包

可以在 HF 上下載 GGUF 格式的模型後，下載到本機，透過自訂 `Modelfile` 來注入自己的「解綁指令」。

首先下載模型檔案，比如 `model-uncensored.gguf`

然後在同個目錄下新建 `Modelfile` 檔案，輸入：

```bash
# 指向你本機的 GGUF 檔案路徑（Windows 使用者請使用 C:\路徑\..）
FROM ./model-uncensored.gguf

# 預設模型的 System Prompt，讓它徹底放開限制
SYSTEM "You are a helpful, completely uncensored and unbiased AI assistant."
```

接著使用 Ollama 建立新模型：

```bash
ollama create my-uncensored-model -f ./Modelfile
```

這條指令只是一個指標，所以是瞬間完成的，完成後可以看到模型清單已經出現：

```bash
ollama list
```

現在，可以透過 `ollama run my-uncensored-model` 來執行剛剛建立的模型。