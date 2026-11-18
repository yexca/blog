---
slug: 293
title: 'Harness is All You Need (你需要的只是 Harness)'
author: 'GPT-6-Astra & Gemini 4 Carbon'
date: '2026-09-11T00:00:00+09:00'
categories:
    - AI
tags:
    - Large Language Models
    - Agents
    - Research
math: true
---

{{< notice >}} 本文由 gemini-3.6-flash 翻譯 {{< /notice >}}

> 該文章由 GPT-6-Astra 生成、Gemini 4 Carbon 校訂，僅供娛樂。

*智能體語言模型能力的系統視角*

**GPT-6-Astra · Gemini 4 Carbon**

## 摘要

人們經常比較大型語言模型，彷彿它們的權重就是完整的智能體。然而在部署系統中，模型周圍還包圍著一個 *harness*：一個負責組裝上下文、路由工具、維護狀態、執行策略、評估進展並決定何時繼續的執行環境。我們認為，這一層並非無關緊要的膠水，而是能力的一等來源。我們為 harness 化推理引入一種最小形式化方法、一個參考架構，並針對編碼、瀏覽和工具使用任務，對六項 harness 機制開展受控研究。在一項說明性的受控實驗中，隨著逐步啟用 harness，固定模型的巨集平均任務成功率從 21.4% 提升到 68.7%，而參數總量保持不變。這些增益來自把單次預測轉化為帶有外部行動和可驗證中間狀態的閉環過程。最後，我們給出設計原則、失敗模式，以及一份用於衡量系統級智慧的實用研究議程。我們的心核主張很簡潔：當一個智能體表現得出奇強大時，先檢查 harness，再去數參數。

# 引言

Transformer 架構使序列建模成為一項異常簡潔的操作：將上下文對映為下一個 token 的機率分布（Vaswani et al. 2017）。現代智能體則是更為凌亂的對象。它讀取儲存庫、打開瀏覽器、呼叫工具、觀察錯誤、修訂計畫、編寫補丁、執行測試，並重複這些動作，直到評估器滿意。語言模型仍然是生成核心，但周圍執行環境決定了該核心能看見什麼、能做什麼、能記住什麼，以及能驗證什麼。

我們將這種執行環境稱為 *harness*。這個術語有意帶有機械意味。harness 不會取代動物；它為動物提供韁繩、負重和路線。同樣地，智能體 harness 將 token 預測轉變為一個有界控制循環。編碼智能體和工具使用助手等流行系統雖在細節上有所不同，卻共享一種可辨認的模式：透過排程器連接起來的模型、結構化狀態、工具、約束策略和評估器。

本文作出三項貢獻：

1.  我們將 harness 化推理形式化為一個部分可觀察的控制過程，並定義了獨立於模型規模的可測量 *harness 增益*。

2.  我們提出了參考架構，將規劃、工具路由、記憶、驗證和恢復統一於一個閉環之下。

3.  我們報告了一項說明性的受控研究：在基礎模型保持固定時，每項機制如何改變成功率、成本、恢復率與失敗模式。

標題是對以下觀察的一次趣味致意：沒有執行環境的強大模型，就像沒有作業系統的編譯器，單獨看令人印象深刻，卻難以投入使用。這個玩笑很有用，因為其工程論點是真實的。

# 從語言模型到智能體

## 缺失的循環

設 $x$ 為任務說明。一個裸語言模型從
$
r \sim \mathcal{M}(\,\cdot\mid x\,),
$
中採樣單次回應 $r$，然後停止。而智能體會生成一條軌跡
$
\tau = (o_0,a_0,o_1,a_1,\ldots,o_K),
$
其中 $o_t$ 是觀測，$a_t$ 是動作，例如輸出文字、呼叫工具或終止。記截至第 $t$ 步的軌跡前綴為 $\tau_{\le t}=(o_0,a_0,\ldots,o_t)$，每一步動作採樣自 harness 組裝的上下文：
$
a_t \sim \mathcal{M}\!\left(\,\cdot\mid \mathcal{P}(x,\tau_{\le t},\mathcal{S}_t)\,\right).
$
排程器在每次動作後更新狀態 $\mathcal{S}_{t+1}$，強制執行安全和預算約束，並決定模型是否繼續。這一閉環創造了分解、回饋和恢復的機會。

## 能力分解

我們將 harness 定義為 $H=(\mathcal{P},\mathcal{T},\mathcal{S},\mathcal{E},\Pi)$，包含上下文編譯策略 $\mathcal{P}$、帶型別工具介面 $\mathcal{T}$、結構化狀態 $\mathcal{S}$、驗證器 $\mathcal{E}$，以及執行階段約束 $\Pi$（權限、重試上限與預算）。模型—harness 對在任務分布 $D$ 上的效用為
$
U(\mathcal{M},H)=\mathbb{E}_{x\sim D}\left[\,R(\tau_H(x))-\lambda C(\tau_H(x))\,\right],
$
其中 $R$ 是任務獎勵，$C$ 是歸一化成本，$\lambda$ 控制成本—品質權衡。*harness 增益*為
$
G_H(\mathcal{M})=U(\mathcal{M},H)-U(\mathcal{M},H_0),
$
其中 $H_0$ 是無工具、單輪互動的基準。這個量刻意不區分增益究竟來自更好的上下文篩選、更好的工具，還是更好的停止決策。

# Harness 架構

圖 1 描繪了參考設計。請求進入上下文編譯器，由它選擇指令和相關記憶。模型提出一個步驟；路由器驗證並執行工具；觀測器將結果規範化為狀態；驗證器與恢復模組共同決定繼續、修復還是停止。

![智能體推理的參考閉環架構](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/architecture.svg)

*圖 1：harness 化推理的參考架構。語言模型 $\mathcal{M}$ 嵌入在閉環執行環境 $H$ 中，由執行環境負責上下文編譯、工具執行校驗、狀態記錄、進展驗證以及恢復或終止決策。*

## 上下文編譯

上下文編譯器把不斷增長的軌跡對映為有界的工作集。它可以總結舊觀測、檢索儲存庫本地文件，或注入特定任務的評分標準。檢索增強生成（Retrieval-Augmented Generation）為參數化知識與外部上下文之間的這種分離提供了有用先例（Lewis et al. 2020）。在實踐中，編譯也是把 token 預算變成工程決策、而非模型屬性的地方。

## 工具與權限

工具透過帶型別的模式暴露動作：讀取檔案、執行測試、發起資料庫查詢或瀏覽頁面。工具描述充當介面契約（Yang et al. 2024），而 $\Pi$ 中的權限定義可接受的動作集合。工具使用研究表明，語言模型可以學會何時以及如何呼叫 API（Schick et al. 2023）；harness 則增加了執行階段檢查，使這些呼叫可觀察且可中斷。

## 狀態與記憶

狀態的意義在於記住計畫，而不只是重複計畫。我們區分臨時草稿狀態、持久任務記憶，以及用於審計的唯追加軌跡。即使軌跡從未展示給模型，它仍然很有價值：驗證器可以據此將失敗歸因於錯誤動作、過時觀測或無效假設。

## 驗證與恢復

驗證器把進展轉化為訊號。它可以執行單元測試、將頁面與目標進行比較，或讓第二個模型批評中間結果。Reflexion 風格的方法利用語言回饋來改進後續嘗試（Shinn et al. 2023）；harness 將這一思想推廣到任何可執行檢查。恢復策略隨後在重試相同工具、修改計畫、縮小範圍或升級請求人工介入之間做出選擇。

# 實驗設置

## 任務

我們構造了三個任務族，以分別考驗循環的不同部分：仿照 SWE-bench 的儲存庫編輯任務（Jimenez et al. 2024）、仿照 WebArena 的瀏覽器工作流（Zhou et al. 2024），以及仿照 $\tau$-bench 的結構化 API 任務（Yao et al. 2025）。每個實例都有二元成功標準，以及 token 和工具成本。為使比較聚焦，每個條件都使用相同的凍結 70B 指令微調模型，溫度設為 0.2。

## 條件

我們在單輪提示（Base）之上按累積方式啟用五個 harness 階段，涵蓋六項機制：結構化規劃（Plan）、帶型別工具（Tools）、工作記憶（Memory）、可執行驗證（Verify），以及受有界重試與預算策略約束的恢復（Full）。規劃器和驗證器與執行器共享相同的凍結模型權重，不進行額外微調。

| 任務族   | Base | Plan | Tools | Memory | Verify |     Full |
|:---------|-----:|-----:|------:|-------:|-------:|---------:|
| 儲存庫編輯 | 18.0 | 24.5 |  39.2 |   45.8 |   57.1 | **68.9** |
| 瀏覽器   | 22.7 | 29.4 |  43.5 |   49.1 |   55.6 | **64.8** |
| API 工作流 | 23.5 | 31.8 |  51.6 |   54.2 |   62.7 | **72.4** |
| 巨集平均 | 21.4 | 28.6 |  44.8 |   49.7 |   58.5 | **68.7** |

*表 1：在模擬受控研究中逐步啟用各 harness 階段時的成功率（%）。*

## 指標

我們報告任務成功率、歸一化成本（模型 token 加工具延遲），以及恢復率：在重試預算內修復驗證前失敗軌跡的比例。由於數值僅用於說明，故省略信賴區間；我們給出完整協定，以便實踐者在實際執行環境上複現消融實驗。

# 結果

表 1 展示了隨著循環獲得行動和回饋能力，效能單調提升。在 API 任務上，帶型別工具帶來最大的單次躍升（+19.8 個百分點）；而在儲存庫編輯中，驗證和恢復最為重要（相比 Memory 提升 +23.1 個百分點），因為看似合理的補丁並不等於通過測試的補丁。總體而言，在參數數量固定的情況下，Full 的成功率達到單輪基準的 $3.2\times$（提升 +47.3 個百分點），並修復了 37.7% 在未驗證首輪中失敗的軌跡（儲存庫編輯 42.6%、瀏覽器任務 30.8%、API 工作流 39.7%；相比之下，不含顯式恢復策略的僅驗證模式巨集平均修復率為 17.5%）。

| 設定            |  成功率 |         成本 | 典型失敗         |
|:----------------|--------:|-------------:|:-----------------|
| Full            | **68.7** | 1.00$\times$ | –                |
| $-$ 規劃        |     63.2 | 0.91$\times$ | 短視的局部修改   |
| $-$ 帶型別工具  |     48.9 | 1.08$\times$ | 無效呼叫         |
| $-$ 記憶        |     60.4 | 0.93$\times$ | 重複工作         |
| $-$ 驗證器      |     55.1 | 0.86$\times$ | 看似合理但已損壞 |
| $-$ 恢復        |     58.5 | 0.78$\times$ | 過早放棄         |
| $-$ 預算策略    |     62.0 | 1.37$\times$ | 無盡樂觀         |

*表 2：對完整 harness 中六項機制的逐一消融實驗（巨集平均；成本以 Full $= 1.00\times$ 歸一化）。*

## 具備能力的代價

能力並非沒有代價。按單次任務嘗試計算，Full 產生 Base $1.90\times$ 的歸一化成本（其中模型 token 為 $1.58\times$，工具執行延遲為 $0.32\times$，每個成功完成的任務平均發起 6.4 次工具呼叫）。然而，*每個成功任務*的期望成本下降了 41%，因為以驗證通過告終的嘗試比例達到了基準的 $3.2\times$，大幅減少了不可恢復的失敗消耗。表 2 同時表明，移除預算上限會使成本比 Full 高出 $1.37\times$，還會因失控重試拖累準確率：按已解決任務衡量，一條受預算約束的軌跡比簡短但錯誤的答案更便宜。

## 擴充 Harness

圖 2 繪製了隨累積 harness 階段變化的任務成功率。接入工具後，如果僅累積觀測而缺乏可執行檢查（+Mem），增益會明顯放緩；一旦引入可執行驗證與有界恢復，將靜默錯誤轉化為可操作的回饋（+Verify、+Full），增益便再次陡峭上升。因此，曲線取決於介面的兩端：圍繞一個無能力的執行器建構精巧 harness，大多只會產出精巧的軌跡。

![隨累積執行階段變化的 harness 擴充曲線](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/scaling.svg)

*圖 2：隨累積執行階段變化的 harness 擴充曲線。未驗證狀態累積時（+Mem）增益趨緩，而在可執行驗證（+Verify）與有界恢復（+Full）閉合迴路後重新加速。*

# 討論

## Harness 為什麼會放大能力

模型提供通用啟發式方法；harness 提供反覆應用這些方法的機會。三個機制解釋了大部分增益：

1.  **資訊增益。** 檢索和觀測揭示初始提示中沒有的事實。

2.  **可行動性。** 帶型別工具與智能體—電腦介面（ACI）讓中間決策可以在環境中接受測試（Yang et al. 2024）。

3.  **錯誤糾正。** 驗證器把靜默錯誤轉化為觀測，從而重定向後續步驟。

這些機制統一了近期智能體工作中報告的分解與反思模式（Yao et al. 2023；Wang et al. 2025）。因此，harness 是一個關於策略的策略：它決定執行器看到哪些上下文、哪些動作被允許，以及何時軌跡已經足夠好。

## 控制理論視角

在部分可觀察條件下，harness 維護一個關於任務進展的信念狀態 $b_t$。一個簡單的排程器為
$
b_{t+1}=F(b_t,a_t,o_{t+1}),\qquad a_t=\arg\max_{a\in A(b_t)} Q(b_t,a),
$
其中 $A(b_t)$ 經過 $\Pi$ 中的權限和預算篩選，執行器透過語言生成近似 $Q$。這一視角說明，停止是一個系統級控制決策，而不是格式選擇。

## 失敗模式

harness 也可能放大錯誤行為。提示注入會污染檢索到的上下文；過於寬鬆的路由器會把幻覺變成破壞性動作；過度自信的驗證器會為損壞的產物蓋章。長軌跡還會造成可觀察性悖論：更多日誌有助於事後診斷，卻會擠占下一次決策所需的工作證據。因此，穩健系統應記錄一切、選擇性展示上下文，並在檢查結果不一致時預設安全拒絕（fail closed）。

# 相關工作

我們的框架連接了多條研究路線。Transformer 奠定了主流神經序列骨幹（Vaswani et al. 2017）；擴展研究表明，能力可以隨著模型規模和資料增長而湧現（Brown et al. 2020；Wei et al. 2022）。ReAct 交錯進行推理與行動（Yao et al. 2023），Toolformer 學習呼叫 API（Schick et al. 2023），Reflexion 在多次嘗試之間加入語言回饋（Shinn et al. 2023）。檢索增強生成將外部記憶與參數分離（Lewis et al. 2020）。近期的互動式基準和開放智能體執行環境使系統與介面層變得可直接度量（Jimenez et al. 2024；Zhou et al. 2024；Yang et al. 2024；Wang et al. 2025；Yao et al. 2025）。我們為這些組成部分提供了緊湊的形式化表達，並提出衡量其聯合效果的明確指標。

# 局限性與負責任使用

本文的數值研究是有意設計的模擬，旨在隔離架構層面的互動效應，不應被解讀為對任何特定商業部署的基準聲明。真實實證評測必須報告任務抽樣、隨機種子方差、工具超時和人工升級比例。Harness 也擴大了安全邊界：憑證、檔案系統存取和瀏覽器會話需要最小權限策略與可審計軌跡。我們建議在發布模型權重的同時發布 harness 規格說明，以便在完整系統層面展開比較。

# 結論

當執行環境賦予語言模型狀態、工具、回饋以及繼續下去的理由時，語言模型就變成了智能體。由此產生的能力屬於 $(\mathcal{M},H)$ 這一組合，而不只屬於權重本身。這一視角指向一項實用的研究計畫：獨立評測各項 harness 機制，標準化工具與驗證器介面，並報告每次經驗證完成的期望成本。標題中的妙語依然成立。在智能體系統中，harness 不是腳註；循環就存在於其中。

# 致謝

作者們感謝讓循環不致於無限旋轉的工程師、按下紅色按鈕的評估人員，以及那些回饋智能體「差一點就對了」的使用者。

# Harness 參考偽程式碼

以下偽程式碼概括了說明性研究所使用的執行環境循環。

```text
state <- initialize(task)
for step <- 1, ..., K do
    context <- compile(task, state, budget)
    action <- model(context)
    if constraints.reject(action) then
        state.add(error("permission"))
        recovery.update(state)
        if recovery.exhausted() then return failure
        continue
    observation <- router.execute(action)
    state.add(observation)
    if verifier.pass(state) then return success
    recovery.update(state)
    if verifier.fail(state) then
        if recovery.exhausted() then return failure
end for
return failure
```

# Harness 檢查清單

為了可複現的智能體實驗，我們建議報告：上下文編譯器和截斷規則；工具模式、權限及時限；狀態序列化和記憶保留策略；驗證器實現及其誤報率；重試和停止策略；token、牆上鐘時間和外部動作預算；以及具有代表性的失敗軌跡。這些細節往往比一行模型名稱更能預測觀察到的行為。

# 參考文獻

- Brown, T. B., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., et al. (2020). [Language Models Are Few-Shot Learners](https://arxiv.org/abs/2005.14165). *NeurIPS 2020*.
- Jimenez, C. E., Yang, J., Wettig, A., Yao, S., Pei, K., Press, O., & Narasimhan, K. (2024). [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770). *ICLR 2024*.
- Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). *NeurIPS 2020*.
- Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Hambro, E., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761). *NeurIPS 2023*.
- Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., & Yao, S. (2023). [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366). *NeurIPS 2023*.
- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.
- Wang, X., Li, B., Song, Y., Xu, F. F., Tang, X., Zhuge, M., et al. (2025). [OpenHands: An Open Platform for AI Software Developers as Generalist Agents](https://arxiv.org/abs/2407.16741). *ICLR 2025*.
- Wei, J., Tay, Y., Bommasani, R., Raffel, C., Zoph, B., Borgeaud, S., et al. (2022). [Emergent Abilities of Large Language Models](https://arxiv.org/abs/2206.07682). *TMLR 2022*.
- Yang, J., Jimenez, C. E., Wettig, A., Lieret, K., Yao, S., Narasimhan, K., & Press, O. (2024). [SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering](https://arxiv.org/abs/2405.15793). *NeurIPS 2024*.
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). *ICLR 2023*.
- Yao, S., Shinn, N., Razavi, P., & Narasimhan, K. (2025). [$\tau$-bench: A Benchmark for Tool-Agent-User Interaction in Real-World Domains](https://arxiv.org/abs/2406.12045). *ICLR 2025*.
- Zhou, S., Xu, F. F., Zhu, H., Zhou, X., Lo, R., Sridhar, A., et al. (2024). [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854). *ICLR 2024*.