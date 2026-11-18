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

> 该文章由 GPT-6-Astra 生成、Gemini 4 Carbon 校订，仅供娱乐。

*智能体语言模型能力的系统视角*

**GPT-6-Astra · Gemini 4 Carbon**

## 摘要

人们经常比较大型语言模型，仿佛它们的权重就是完整的智能体。然而在部署系统中，模型周围还包围着一个 *harness*：一个负责组装上下文、路由工具、维护状态、执行策略、评估进展并决定何时继续的运行时。我们认为，这一层并非无关紧要的胶水，而是能力的一等来源。我们为 harness 化推理引入一种最小形式化方法、一个参考架构，并针对编码、浏览和工具使用任务，对六项 harness 机制开展受控研究。在一项说明性的受控实验中，随着逐步启用 harness，固定模型的宏平均任务成功率从 21.4% 提升到 68.7%，而参数总量保持不变。这些增益来自把单次预测转化为带有外部行动和可验证中间状态的闭环过程。最后，我们给出设计原则、失败模式，以及一份用于衡量系统级智能的实用研究议程。我们的核心主张很简洁：当一个智能体表现得出奇强大时，先检查 harness，再去数参数。

# 引言

Transformer 架构使序列建模成为一项异常简洁的操作：将上下文映射为下一个 token 的概率分布（Vaswani et al. 2017）。现代智能体则是更为凌乱的对象。它读取仓库、打开浏览器、调用工具、观察错误、修订计划、编写补丁、运行测试，并重复这些动作，直到评估器满意。语言模型仍然是生成核心，但周围运行时决定了该核心能看见什么、能做什么、能记住什么，以及能验证什么。

我们将这种运行时称为 *harness*。这个术语有意带有机械意味。harness 不会取代动物；它为动物提供缰绳、负重和路线。同样，智能体 harness 将 token 预测转变为一个有界控制循环。编码智能体和工具使用助手等流行系统虽在细节上有所不同，却共享一种可辨认的模式：通过调度器连接起来的模型、结构化状态、工具、约束策略和评估器。

本文作出三项贡献：

1.  我们将 harness 化推理形式化为一个部分可观测的控制过程，并定义了独立于模型规模的可测量 *harness 增益*。

2.  我们提出了一个参考架构，将规划、工具路由、记忆、验证和恢复统一于一个闭环之下。

3.  我们报告了一项说明性的受控研究：在基础模型保持固定时，每项机制如何改变成功率、成本、恢复率与失败模式。

标题是对以下观察的一次趣味致意：没有运行时的强大模型，就像没有操作系统的编译器，单独看令人印象深刻，却难以投入使用。这个玩笑很有用，因为其工程论点是真实的。

# 从语言模型到智能体

## 缺失的循环

设 $x$ 为任务说明。一个裸语言模型从
$$
r \sim \mathcal{M}(\,\cdot\mid x\,),
$$
中采样单次响应 $r$，然后停止。而智能体会生成一条轨迹
$$
\tau = (o_0,a_0,o_1,a_1,\ldots,o_K),
$$
其中 $o_t$ 是观测，$a_t$ 是动作，例如输出文本、调用工具或终止。记截至第 $t$ 步的轨迹前缀为 $\tau_{\le t}=(o_0,a_0,\ldots,o_t)$，每一步动作采样自 harness 组装的上下文：
$$
a_t \sim \mathcal{M}\!\left(\,\cdot\mid \mathcal{P}(x,\tau_{\le t},\mathcal{S}_t)\,\right).
$$
调度器在每次动作后更新状态 $\mathcal{S}_{t+1}$，强制执行安全和预算约束，并决定模型是否继续。这一闭环创造了分解、反馈和恢复的机会。

## 能力分解

我们将 harness 定义为 $H=(\mathcal{P},\mathcal{T},\mathcal{S},\mathcal{E},\Pi)$，包含上下文编译策略 $\mathcal{P}$、带类型工具接口 $\mathcal{T}$、结构化状态 $\mathcal{S}$、验证器 $\mathcal{E}$，以及运行时约束 $\Pi$（权限、重试上限与预算）。模型—harness 对在任务分布 $D$ 上的效用为
$$
U(\mathcal{M},H)=\mathbb{E}_{x\sim D}\left[\,R(\tau_H(x))-\lambda C(\tau_H(x))\,\right],
$$
其中 $R$ 是任务奖励，$C$ 是归一化成本，$\lambda$ 控制成本—质量权衡。*harness 增益*为
$$
G_H(\mathcal{M})=U(\mathcal{M},H)-U(\mathcal{M},H_0),
$$
其中 $H_0$ 是无工具、单轮交互的基线。这个量刻意不区分增益究竟来自更好的上下文筛选、更好的工具，还是更好的停止决策。

# Harness 架构

图 1 描绘了参考设计。请求进入上下文编译器，由它选择指令和相关记忆。模型提出一个步骤；路由器验证并执行工具；观测器将结果规范化为状态；验证器与恢复模块共同决定继续、修复还是停止。

![智能体推理的参考闭环架构](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/architecture.svg)

*图 1：harness 化推理的参考架构。语言模型 $\mathcal{M}$ 嵌入在闭环运行时 $H$ 中，由运行时负责上下文编译、工具执行校验、状态记录、进展验证以及恢复或终止决策。*

## 上下文编译

上下文编译器把不断增长的轨迹映射为有界的工作集。它可以总结旧观测、检索仓库本地文档，或注入特定任务的评分标准。检索增强生成（Retrieval-Augmented Generation）为参数化知识与外部上下文之间的这种分离提供了有用先例（Lewis et al. 2020）。在实践中，编译也是把 token 预算变成工程决策、而非模型属性的地方。

## 工具与权限

工具通过带类型的模式暴露动作：读取文件、运行测试、发起数据库查询或浏览页面。工具描述充当接口契约（Yang et al. 2024），而 $\Pi$ 中的权限定义可接受的动作集合。工具使用研究表明，语言模型可以学会何时以及如何调用 API（Schick et al. 2023）；harness 则增加了运行时检查，使这些调用可观测且可中断。

## 状态与记忆

状态的意义在于记住计划，而不只是重复计划。我们区分临时草稿状态、持久任务记忆，以及用于审计的只追加轨迹。即使轨迹从未展示给模型，它仍然很有价值：验证器可以据此将失败归因于错误动作、过时观测或无效假设。

## 验证与恢复

验证器把进展转化为信号。它可以运行单元测试、将页面与目标进行比较，或让第二个模型批评中间结果。Reflexion 风格的方法利用语言反馈来改进后续尝试（Shinn et al. 2023）；harness 将这一思想推广到任何可执行检查。恢复策略随后在重试相同工具、修改计划、缩小范围或升级请求人工介入之间做出选择。

# 实验设置

## 任务

我们构造了三个任务族，以分别考验循环的不同部分：仿照 SWE-bench 的仓库编辑任务（Jimenez et al. 2024）、仿照 WebArena 的浏览器工作流（Zhou et al. 2024），以及仿照 $\tau$-bench 的结构化 API 任务（Yao et al. 2025）。每个实例都有二元成功标准，以及 token 和工具成本。为使比较聚焦，每个条件都使用相同的冻结 70B 指令微调模型，温度设为 0.2。

## 条件

我们在单轮提示（Base）之上按累积方式启用五个 harness 阶段，涵盖六项机制：结构化规划（Plan）、带类型工具（Tools）、工作记忆（Memory）、可执行验证（Verify），以及受有界重试与预算策略约束的恢复（Full）。规划器和验证器与执行器共享相同的冻结模型权重，不进行额外微调。

| 任务族   | Base | Plan | Tools | Memory | Verify |     Full |
|:---------|-----:|-----:|------:|-------:|-------:|---------:|
| 仓库编辑 | 18.0 | 24.5 |  39.2 |   45.8 |   57.1 | **68.9** |
| 浏览器   | 22.7 | 29.4 |  43.5 |   49.1 |   55.6 | **64.8** |
| API 工作流 | 23.5 | 31.8 |  51.6 |   54.2 |   62.7 | **72.4** |
| 宏平均   | 21.4 | 28.6 |  44.8 |   49.7 |   58.5 | **68.7** |

*表 1：在模拟受控研究中逐步启用各 harness 阶段时的成功率（%）。*

## 指标

我们报告任务成功率、归一化成本（模型 token 加工具延迟），以及恢复率：在重试预算内修复验证前失败轨迹的比例。由于数值仅用于说明，故省略置信区间；我们给出完整协议，以便实践者在实际运行时上复现消融实验。

# 结果

表 1 展示了随着循环获得行动和反馈能力，性能单调提升。在 API 任务上，带类型工具带来最大的单次跃升（+19.8 个百分点）；而在仓库编辑中，验证和恢复最为重要（相比 Memory 提升 +23.1 个百分点），因为看似合理的补丁并不等于通过测试的补丁。总体而言，在参数数量固定的情况下，Full 的成功率达到单轮基线的 $3.2\times$（提升 +47.3 个百分点），并修复了 37.7% 在未验证首轮中失败的轨迹（仓库编辑 42.6%、浏览器任务 30.8%、API 工作流 39.7%；相比之下，不含显式恢复策略的仅验证模式宏平均修复率为 17.5%）。

| 配置            |  成功率 |         成本 | 典型失败         |
|:----------------|--------:|-------------:|:-----------------|
| Full            | **68.7** | 1.00$\times$ | –                |
| $-$ 规划        |     63.2 | 0.91$\times$ | 短视的局部修改   |
| $-$ 带类型工具  |     48.9 | 1.08$\times$ | 无效调用         |
| $-$ 记忆        |     60.4 | 0.93$\times$ | 重复工作         |
| $-$ 验证器      |     55.1 | 0.86$\times$ | 看似合理但已损坏 |
| $-$ 恢复        |     58.5 | 0.78$\times$ | 过早放弃         |
| $-$ 预算策略    |     62.0 | 1.37$\times$ | 无尽乐观         |

*表 2：对完整 harness 中六项机制的逐一消融实验（宏平均；成本以 Full $= 1.00\times$ 归一化）。*

## 具备能力的代价

能力并非没有代价。按单次任务尝试计算，Full 产生 Base $1.90\times$ 的归一化成本（其中模型 token 为 $1.58\times$，工具执行延迟为 $0.32\times$，每个成功完成的任务平均发起 6.4 次工具调用）。然而，*每个成功任务*的期望成本下降了 41%，因为以验证通过告终的尝试比例达到了基线的 $3.2\times$，大幅减少了不可恢复的失败消耗。表 2 同时表明，移除预算上限会使成本比 Full 高出 $1.37\times$，还会因失控重试拖累准确率：按已解决任务衡量，一条受预算约束的轨迹比简短但错误的答案更便宜。

## 扩展 harness

图 2 绘制了随累积 harness 阶段变化的任务成功率。接入工具后，如果仅累积观测而缺乏可执行检查（+Mem），增益会明显放缓；一旦引入可执行验证与有界恢复，将静默错误转化为可操作的反馈（+Verify、+Full），增益便再次陡峭上升。因此，曲线取决于接口的两端：围绕一个无能力的执行器构建精巧 harness，大多只会产出精巧的轨迹。

![随累积运行时阶段变化的 harness 扩展曲线](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/scaling.svg)

*图 2：随累积运行时阶段变化的 harness 扩展曲线。未验证状态累积时（+Mem）增益趋缓，而在可执行验证（+Verify）与有界恢复（+Full）闭合回路后重新加速。*

# 讨论

## harness 为什么会放大能力

模型提供通用启发式方法；harness 提供反复应用这些方法的机会。三个机制解释了大部分增益：

1.  **信息增益。** 检索和观测揭示初始提示中没有的事实。

2.  **可行动性。** 带类型工具与智能体—计算机接口（ACI）让中间决策可以在环境中接受测试（Yang et al. 2024）。

3.  **错误纠正。** 验证器把静默错误转化为观测，从而重定向后续步骤。

这些机制统一了近期智能体工作中报告的分解与反思模式（Yao et al. 2023；Wang et al. 2025）。因此，harness 是一个关于策略的策略：它决定执行器看到哪些上下文、哪些动作被允许，以及何时轨迹已经足够好。

## 控制理论视角

在部分可观测条件下，harness 维护一个关于任务进展的信念状态 $b_t$。一个简单的调度器为
$$
b_{t+1}=F(b_t,a_t,o_{t+1}),\qquad a_t=\arg\max_{a\in A(b_t)} Q(b_t,a),
$$
其中 $A(b_t)$ 经过 $\Pi$ 中的权限和预算筛选，执行器通过语言生成近似 $Q$。这一视角说明，停止是一个系统级控制决策，而不是格式选择。

## 失败模式

harness 也可能放大错误行为。提示注入会污染检索到的上下文；过于宽松的路由器会把幻觉变成破坏性动作；过度自信的验证器会为损坏的产物盖章。长轨迹还会造成可观测性悖论：更多日志有助于事后诊断，却会挤占下一次决策所需的工作证据。因此，稳健系统应记录一切、选择性展示上下文，并在检查结果不一致时默认安全拒绝（fail closed）。

# 相关工作

我们的框架连接了多条研究路线。Transformer 奠定了主流神经序列骨干（Vaswani et al. 2017）；扩展研究表明，能力可以随着模型规模和数据增长而涌现（Brown et al. 2020；Wei et al. 2022）。ReAct 交错进行推理与行动（Yao et al. 2023），Toolformer 学习调用 API（Schick et al. 2023），Reflexion 在多次尝试之间加入语言反馈（Shinn et al. 2023）。检索增强生成将外部记忆与参数分离（Lewis et al. 2020）。近期的交互式基准和开放智能体运行时使系统与接口层变得可直接度量（Jimenez et al. 2024；Zhou et al. 2024；Yang et al. 2024；Wang et al. 2025；Yao et al. 2025）。我们为这些组成部分提供了紧凑的形式化表达，并提出衡量其联合效果的明确指标。

# 局限性与负责任使用

本文的数值研究是有意设计的模拟，旨在隔离架构层面的交互效应，不应被解读为对任何特定商业部署的基准声明。真实实证评测必须报告任务抽样、随机种子方差、工具超时和人工升级比例。Harness 也扩大了安全边界：凭据、文件系统访问和浏览器会话需要最小权限策略与可审计轨迹。我们建议在发布模型权重的同时发布 harness 规格说明，以便在完整系统层面展开比较。

# 结论

当运行时赋予语言模型状态、工具、反馈以及继续下去的理由时，语言模型就变成了智能体。由此产生的能力属于 $(\mathcal{M},H)$ 这一组合，而不只属于权重本身。这一视角指向一项实用的研究计划：独立评测各项 harness 机制，标准化工具与验证器接口，并报告每次经验证完成的期望成本。标题中的妙语依然成立。在智能体系统中，harness 不是脚注；循环就存在于其中。

# 致谢

作者们感谢让循环不至于无限旋转的工程师、按下红色按钮的评估人员，以及那些反馈智能体“差一点就对了”的用户。

# Harness 参考伪代码

以下伪代码概括了说明性研究所使用的运行时循环。

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

# Harness 检查清单

为了可复现的智能体实验，我们建议报告：上下文编译器和截断规则；工具模式、权限及时限；状态序列化和记忆保留策略；验证器实现及其误报率；重试和停止策略；token、挂钟时间和外部动作预算；以及具有代表性的失败轨迹。这些细节往往比一行模型名称更能预测观测到的行为。

# 参考文献

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
