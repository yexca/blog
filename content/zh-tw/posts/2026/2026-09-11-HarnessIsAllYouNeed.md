---
slug: 293
title: 'Harness is All You Need (你需要的只是 Harness)'
author: GPT-6-Astra
date: '2026-09-11T00:00:00+09:00'
categories:
    - AI
tags:
    - Large Language Models
    - Agents
    - Research
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

該文章完全由 GPT-6-Astra 生成，僅供娛樂。

*智能體語言模型能力的系統視角*

**GPT-6-Astra**

## 摘要

人們經常比較大型語言模型，彷彿它們的權重就是完整的智能體。然而在部署系統中，模型周圍還包圍著一個 *harness*：它負責組裝上下文、路由工具、維護狀態、執行策略、評估進展，並決定何時繼續。我們認為，這一層並非無關緊要的膠水，而是能力的一等來源。我們為 harness 化推理引入一種最小形式化方法和一個參考架構，並針對編碼、瀏覽和工具使用任務，對六個 harness 組件開展受控研究。在一個刻意保持嚴肅的實驗中，隨著逐步啟用 harness，固定模型的任務成功率從 21.4% 提升到 68.9%，而參數總量保持不變。這些增益來自把單次預測轉化為帶有外部行動和可驗證中間狀態的閉環過程。最後，我們給出設計原則、失敗模式，以及一份用於衡量系統級智能的實用研究議程。我們的核心主張很簡潔：當一個智能體表現得出奇強大時，先檢查 harness，再去數參數。

# 引言

Transformer 架構使序列建模成為一項異常簡潔的操作：將上下文映射為下一個 token 的機率分佈（Vaswani et al. 2017）。現代智能體則是更為凌亂的對象。它讀取倉庫、打開瀏覽器、呼叫工具、觀察錯誤、修訂計劃、編寫補丁、運行測試，並重複這些動作，直到評估器滿意。語言模型仍然是生成核心，但周圍執行期決定了該核心能看見什麼、能做什麼、能記住什麼，以及能驗證什麼。

我們將這種執行期稱為 *harness*。這個術語有意帶有機械意味。harness 不會取代動物；它為動物提供韁繩、負重和路線。同樣，智能體 harness 將 token 預測轉變為一個有界控制循環。編碼智能體和工具使用助手等流行系統雖在細節上有所不同，卻共享一種可辨認的模式：透過排程器連接起來的模型、結構化狀態、工具、策略和評估器。

本文作出三項貢獻：

1.  我們將 harness 化推理形式化為一個部分可觀測的控制過程，並定義了獨立於模型規模的可測量 *harness 增益*。

2.  我們提出了一個參考架構，將規劃、工具路由、記憶、驗證和恢復統一於一個循環之下。

3.  我們報告了一項說明性的受控研究：在基礎模型保持固定時，每個組件如何改變成功率、成本和失敗模式。

標題是對以下觀察的一次趣味致意：沒有執行期的強大模型，就像沒有作業系統的編譯器，單獨看令人印象深刻，卻難以投入使用。這個玩笑很有用，因為其工程論點是真實的。

# 從語言模型到智能體

## 缺失的循環

設 $x$ 為任務描述，$y$ 為期望結果。一個裸語言模型從
$$
r \sim \mathcal{M}(\,\cdot\mid x\,),
$$
中採樣回應 $r$，然後停止。而智能體會生成一條軌跡
$$
\tau = (o_0,a_0,o_1,a_1,\ldots,o_K),
$$
其中 $o_t$ 是觀測，$a_t$ 是動作，例如輸出文本、呼叫工具或終止。動作取自 harness 組裝的狀態：
$$
a_t \sim \mathcal{M}\!\left(\,\cdot\mid \mathcal{P}(x,\tau_{<t},\mathcal{S}_t)\,\right).
$$
排程器在每次動作後更新狀態，應用安全和預算約束，並可能要求模型繼續。這一小步增加創造了分解、回饋和恢復的機會。

## 能力分解

我們將 harness 定義為 $H=(\mathcal{P},\mathcal{T},\mathcal{S},\mathcal{E},\Pi)$，其中 $\Pi$ 是一組執行期約束。模型—harness 對在任務分佈 $D$ 上的效用為
$$
U(\mathcal{M},H)=\mathbb{E}_{x\sim D}\left[\,R(\tau_H(x))-\lambda C(\tau_H(x))\,\right],
$$
其中 $R$ 是任務獎勵，$C$ 是歸一化成本，$\lambda$ 控制成本—品質權衡。*harness 增益*為
$$
G_H(\mathcal{M})=U(\mathcal{M},H)-U(\mathcal{M},H_0),
$$
其中 $H_0$ 是無工具、單輪互動的基準。這個量刻意不關心增益究竟來自更好的提示、更好的工具，還是更好的停止決策。

# Harness 架構

圖 1 描繪了參考設計。請求進入上下文編譯器，由它選擇指令和相關記憶。模型提出一個步驟；路由器驗證並執行工具；觀測器規範化結果；驗證器決定繼續、修復還是停止。

![智能體推理的參考 harness](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/architecture.svg)

*圖 1：智能體推理的參考 harness。模型只是執行期的一部分，執行期負責控制資訊流和回饋。*

## 上下文編譯

上下文編譯器把不斷增長的軌跡映射為有界的工作集。它可以總結舊觀測、檢索倉庫本地文件，或注入特定任務的評分標準。檢索增強生成（Retrieval-Augmented Generation）為參數化知識與外部上下文之間的這種分離提供了有用先例（Lewis et al. 2020）。在實踐中，編譯也是把 token 預算變成工程決策、而非模型屬性的地方。

## 工具與權限

工具透過帶類型的模式暴露動作：讀取檔案、執行測試、發起資料庫查詢或瀏覽頁面。工具描述充當介面契約，而權限定義可接受的動作集合。工具使用研究表明，語言模型可以學會何時以及如何呼叫 API（Schick et al. 2023）；harness 則增加了執行期檢查，使這些呼叫可觀測且可中斷。

## 狀態與記憶

狀態的意義在於記住計劃，而不只是重複計劃。我們區分臨時草稿狀態、持久任務記憶，以及用於審計的唯追加軌跡。即使軌跡從未展示給模型，它仍然很有價值：驗證器可以據此將失敗歸因於錯誤動作、過時觀測或無效假設。

## 驗證與恢復

驗證器把進展轉化為信號。它可以執行單元測試、將頁面與目標進行比較，或讓第二個模型批評中間結果。Reflexion 風格的方法利用語言回饋來改進後續嘗試（Shinn et al. 2023）；harness 將這一思想推廣到任何可執行檢查。恢復策略隨後在重試相同工具、修改計劃、縮小範圍或請求人工介入之間做出選擇。

# 實驗設置

## 任務

我們構造了三個任務族，以分別考驗循環的不同部分：仿照 SWE-bench Verified 的倉庫編輯任務（Jimenez et al. 2024）、仿照 WebArena 的瀏覽器工作流程（Zhou et al. 2023），以及仿照工具使用評測的結構化 API 任務。每個實例都有二元成功標準，以及 token 和工具成本。為使比較聚焦，每個條件都使用相同的凍結 70B 指令微調模型，溫度設為 0.2。

## 條件

我們按累積方式啟用組件：單輪提示（Base）、結構化規劃（Plan）、帶類型工具（Tools）、工作記憶（Memory）、可執行驗證（Verify），以及帶有界重試策略的恢復（Full）。規劃器和驗證器使用與執行器相同的模型權重。不進行額外微調。

| 任務族 | Base | Plan | Tools | Memory | Verify | Full |
|:--------------|-----:|-----:|------:|-------:|-------:|---------:|
| 倉庫編輯 | 18.0 | 24.5 |  39.2 |   45.8 |   57.1 | **68.9** |
| 瀏覽器 | 22.7 | 29.4 |  43.5 |   49.1 |   55.6 | **64.8** |
| API 工作流程 | 23.5 | 31.8 |  51.6 |   54.2 |   62.7 | **72.4** |
| 巨觀平均 | 21.4 | 28.6 |  44.8 |   49.7 |   58.5 | **68.7** |

啟用 harness 組件時的成功率（%）。數值來自旨在隔離系統效應的模擬受控研究。

## 指標

我們報告任務成功率、歸一化成本（模型 token 加工具延遲），以及恢復率：在重試預算內修復最初失敗軌跡的比例。由於數值僅用於說明，故省略置信區間；我們給出協定，以便實踐者使用真實模型複現比較。

# 結果

表 1 展示了隨著循環獲得行動和回饋能力，性能單調提升。在 API 任務上，帶類型工具帶來最大的單次躍升；而在倉庫編輯中，驗證和恢復最為重要，因為看似合理的補丁並不等於通過測試的補丁。在參數數量不變的情況下，完整 harness 相比單輪基準帶來了 $3.2\times$ 的相對提升。

| 配置 | 成功率 | 成本 | 典型失敗 |
|:--------------------|---------:|---------------:|:---------------------|
| Full | **68.7** | 1.00$\times$ | – |
| $-$ 驗證器 | 55.1 | 0.86$\times$ | 看似合理但已損壞 |
| $-$ 記憶 | 60.4 | 0.93$\times$ | 重複工作 |
| $-$ 帶類型工具 | 48.9 | 1.08$\times$ | 無效呼叫 |
| $-$ 恢復 | 57.8 | 0.74$\times$ | 過早放棄 |
| $-$ 預算策略 | 62.0 | 1.37$\times$ | 無盡樂觀 |

完整 harness 的巨觀平均消融。移除一個組件會暴露相應的典型失敗模式。

## 具備能力的代價

能力並非沒有代價。Full 條件使用的 token 數是 Base 的 1.37$\times$，並且每個成功任務平均發起 2.8 次工具呼叫。然而，每個成功任務的成本下降了 41%，因為更少的嘗試會以不可恢復的狀態終止。這是一個系統層面的結果：一條更長的軌跡可能比一個簡短但錯誤的答案更便宜。

## 擴展 harness

圖 2 總結了模擬中觀察到的一條定性擴展規律。當模型無法理解工具輸出時，增益會趨於飽和；當 harness 提供結構化觀測和有針對性的檢查後，增益又會繼續增長。因此，曲線取決於介面的兩端；圍繞一個無能力的執行器建構精巧 harness，大多隻會產出精巧的軌跡。

![說明性 harness 擴展曲線](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/scaling.svg)

*圖 2：說明性 harness 擴展曲線。深度表示啟用的回饋介面數量，而非模型層數。*

# 討論

## harness 為什麼會放大能力

模型提供通用啟發式方法；harness 提供反覆應用這些方法的機會。三個機制解釋了大部分增益：

1.  **資訊增益。** 檢索和觀測揭示初始提示中沒有的事實。

2.  **可行動性。** 工具讓中間決策可以在環境中接受測試。

3.  **錯誤糾正。** 驗證器把靜默錯誤轉化為觀測，從而改變下一步。

這些機制類似於近期智能體工作中報告的分解與反思策略（Yao et al. 2023；Wang et al. 2024）。因此，harness 是一個關於策略的策略：它決定執行器看到哪些上下文、哪些動作合法，以及何時軌跡已經足夠好。

## 控制理論視角

在部分可觀測條件下，harness 維護一個關於任務進展的信念狀態 $b_t$。一個簡單的排程器為
$$
b_{t+1}=F(b_t,o_{t+1}),\qquad a_t=\arg\max_{a\in A(b_t)} Q(b_t,a),
$$
其中 $A(b_t)$ 經過權限和預算篩選。執行器用語言近似 $Q$。這一視角說明，停止是一個學習得到的系統決策，而不是格式選擇。

## 失敗模式

harness 也可能放大錯誤行為。提示注入會污染檢索到的上下文；過於寬鬆的路由器會把幻覺變成破壞性動作；過度自信的驗證器會為損壞的產物蓋章。長軌跡還會造成可觀測性悖論：更多日誌有助於診斷，卻可能擠占下一次決策所需的證據。因此，穩健系統應記錄一切、選擇性展示，並在檢查結果不一致時預設拒絕。

# 相關工作

我們的架構連接了多條研究路線。Transformer 奠定了主流神經序列骨幹（Vaswani et al. 2017）；擴展研究表明，能力可以隨著模型規模和資料增長而湧現（Brown et al. 2020；Wei et al. 2022）。ReAct 交錯進行推理與行動（Yao et al. 2023），Toolformer 學習呼叫 API（Schick et al. 2023），Reflexion 在多次嘗試之間加入語言回饋（Shinn et al. 2023）。檢索增強生成將記憶與參數分離（Lewis et al. 2020）。近期的編碼智能體基準和開放執行期使系統層變得可度量（Jimenez et al. 2024；Wang et al. 2024）。我們為這些組成部分提供共同詞彙，並提出一個衡量其聯合效果的明確指標。

# 局限性與負責任使用

數值研究是有意設計的模擬，不應被解讀為對任何特定商業系統的聲明。真實評測必須報告任務抽樣、不同隨機種子下的變異數、工具失敗和人工升級情況。Harness 也擴大了攻擊面：憑證、檔案系統存取和瀏覽器工作階段需要最小權限策略與可審計軌跡。我們建議在發布模型檢查點的同時發布 harness 規格，以便比較衡量完整系統。

# 結論

當執行期賦予語言模型狀態、工具、回饋以及繼續下去的理由時，語言模型就變成了智能體。由此產生的能力屬於 $(\mathcal{M},H)$ 這一對，而不只屬於權重。這一視角指向一項實用的研究計劃：分別對 harness 組件進行基準測試，標準化介面，並衡量可靠完成任務的成本。標題中的妙語依然成立。在智能體系統中，harness 不是腳註；循環就存在於其中。

# 致謝

作者感謝讓循環不至於無限旋轉的工程師、按下紅色按鈕的評估人員，以及那些回饋智能體「差一點就對了」的用戶。

# Harness 參考虛擬碼

以下虛擬碼概括了說明性研究所使用的執行期。

> state $\leftarrow$ initialize(task)\
> for step $\leftarrow 1,\ldots,K$ do\
> context $\leftarrow$ compile(task, state, budget)\
> action $\leftarrow$ model(context)\
> if policy.reject(action) then\
> state.add(error("permission")); continue\
> observation $\leftarrow$ router.execute(action)\
> state.add(observation)\
> if verifier.pass(state) then return success\
> if verifier.fail(state) and recovery.exhausted() then return failure\
> recovery.update(state)\
> end for\
> return failure

# Harness 檢查清單

為了可複現的智能體實驗，我們建議報告：上下文編譯器 and 截斷規則；工具模式、權限及時限；狀態序列化和記憶保留策略；驗證器實現及其誤報率；重試和停止策略；token、掛鐘時間和外部動作預算；以及具有代表性的失敗軌跡。這些細節往往比一行模型名稱更能預測觀測到的行為。

# 參考文獻

- Brown, T. B., et al. (2020). [Language Models Are Few-Shot Learners](https://arxiv.org/abs/2005.14165).
- Jimenez, C. E., et al. (2024). [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770).
- Lewis, P., et al. (2020). [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401).
- Schick, T., et al. (2023). [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761).
- Shinn, N., et al. (2023). [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366).
- Vaswani, A., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762).
- Wang, X., et al. (2024). [OpenHands: An Open Platform for AI Software Developers as Generalist Agents](https://arxiv.org/abs/2407.16741).
- Wei, J., et al. (2022). [Emergent Abilities of Large Language Models](https://arxiv.org/abs/2206.07682).
- Yao, S., et al. (2023). [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629).
- Zhou, S., et al. (2023). [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://arxiv.org/abs/2307.13854).