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

该文章完全由 GPT-6-Astra 生成，仅供娱乐。

*智能体语言模型能力的系统视角*

**GPT-6-Astra**

## 摘要

人们经常比较大型语言模型，仿佛它们的权重就是完整的智能体。然而在部署系统中，模型周围还包围着一个 *harness*：它负责组装上下文、路由工具、维护状态、执行策略、评估进展，并决定何时继续。我们认为，这一层并非无关紧要的胶水，而是能力的一等来源。我们为 harness 化推理引入一种最小形式化方法和一个参考架构，并针对编码、浏览和工具使用任务，对六个 harness 组件开展受控研究。在一个刻意保持严肃的实验中，随着逐步启用 harness，固定模型的任务成功率从 21.4% 提升到 68.9%，而参数总量保持不变。这些增益来自把单次预测转化为带有外部行动和可验证中间状态的闭环过程。最后，我们给出设计原则、失败模式，以及一份用于衡量系统级智能的实用研究议程。我们的核心主张很简洁：当一个智能体表现得出奇强大时，先检查 harness，再去数参数。

# 引言

Transformer 架构使序列建模成为一项异常简洁的操作：将上下文映射为下一个 token 的概率分布（Vaswani et al. 2017）。现代智能体则是更为凌乱的对象。它读取仓库、打开浏览器、调用工具、观察错误、修订计划、编写补丁、运行测试，并重复这些动作，直到评估器满意。语言模型仍然是生成核心，但周围运行时决定了该核心能看见什么、能做什么、能记住什么，以及能验证什么。

我们将这种运行时称为 *harness*。这个术语有意带有机械意味。harness 不会取代动物；它为动物提供缰绳、负重和路线。同样，智能体 harness 将 token 预测转变为一个有界控制循环。编码智能体和工具使用助手等流行系统虽在细节上有所不同，却共享一种可辨认的模式：通过调度器连接起来的模型、结构化状态、工具、策略和评估器。

本文作出三项贡献：

1.  我们将 harness 化推理形式化为一个部分可观测的控制过程，并定义了独立于模型规模的可测量 *harness 增益*。

2.  我们提出了一个参考架构，将规划、工具路由、记忆、验证和恢复统一于一个循环之下。

3.  我们报告了一项说明性的受控研究：在基础模型保持固定时，每个组件如何改变成功率、成本和失败模式。

标题是对以下观察的一次趣味致意：没有运行时的强大模型，就像没有操作系统的编译器，单独看令人印象深刻，却难以投入使用。这个玩笑很有用，因为其工程论点是真实的。

# 从语言模型到智能体

## 缺失的循环

设 $x$ 为任务描述，$y$ 为期望结果。一个裸语言模型从
$$
r \sim \mathcal{M}(\,\cdot\mid x\,),
$$
中采样响应 $r$，然后停止。而智能体会生成一条轨迹
$$
\tau = (o_0,a_0,o_1,a_1,\ldots,o_K),
$$
其中 $o_t$ 是观测，$a_t$ 是动作，例如输出文本、调用工具或终止。动作取自 harness 组装的状态：
$$
a_t \sim \mathcal{M}\!\left(\,\cdot\mid \mathcal{P}(x,\tau_{<t},\mathcal{S}_t)\,\right).
$$
调度器在每次动作后更新状态，应用安全和预算约束，并可能要求模型继续。这一小步增加创造了分解、反馈和恢复的机会。

## 能力分解

我们将 harness 定义为 $H=(\mathcal{P},\mathcal{T},\mathcal{S},\mathcal{E},\Pi)$，其中 $\Pi$ 是一组运行时约束。模型—harness 对在任务分布 $D$ 上的效用为
$$
U(\mathcal{M},H)=\mathbb{E}_{x\sim D}\left[\,R(\tau_H(x))-\lambda C(\tau_H(x))\,\right],
$$
其中 $R$ 是任务奖励，$C$ 是归一化成本，$\lambda$ 控制成本—质量权衡。*harness 增益*为
$$
G_H(\mathcal{M})=U(\mathcal{M},H)-U(\mathcal{M},H_0),
$$
其中 $H_0$ 是无工具、单轮交互的基线。这个量刻意不关心增益究竟来自更好的提示、更好的工具，还是更好的停止决策。

# Harness 架构

图 1 描绘了参考设计。请求进入上下文编译器，由它选择指令和相关记忆。模型提出一个步骤；路由器验证并执行工具；观测器规范化结果；验证器决定继续、修复还是停止。

![智能体推理的参考 harness](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/architecture.svg)

*图 1：智能体推理的参考 harness。模型只是运行时的一部分，运行时负责控制信息流和反馈。*

## 上下文编译

上下文编译器把不断增长的轨迹映射为有界的工作集。它可以总结旧观测、检索仓库本地文档，或注入特定任务的评分标准。检索增强生成（Retrieval-Augmented Generation）为参数化知识与外部上下文之间的这种分离提供了有用先例（Lewis et al. 2020）。在实践中，编译也是把 token 预算变成工程决策、而非模型属性的地方。

## 工具与权限

工具通过带类型的模式暴露动作：读取文件、运行测试、发起数据库查询或浏览页面。工具描述充当接口契约，而权限定义可接受的动作集合。工具使用研究表明，语言模型可以学会何时以及如何调用 API（Schick et al. 2023）；harness 则增加了运行时检查，使这些调用可观测且可中断。

## 状态与记忆

状态的意义在于记住计划，而不只是重复计划。我们区分临时草稿状态、持久任务记忆，以及用于审计的只追加轨迹。即使轨迹从未展示给模型，它仍然很有价值：验证器可以据此将失败归因于错误动作、过时观测或无效假设。

## 验证与恢复

验证器把进展转化为信号。它可以运行单元测试、将页面与目标进行比较，或让第二个模型批评中间结果。Reflexion 风格的方法利用语言反馈来改进后续尝试（Shinn et al. 2023）；harness 将这一思想推广到任何可执行检查。恢复策略随后在重试相同工具、修改计划、缩小范围或请求人工介入之间做出选择。

# 实验设置

## 任务

我们构造了三个任务族，以分别考验循环的不同部分：仿照 SWE-bench Verified 的仓库编辑任务（Jimenez et al. 2024）、仿照 WebArena 的浏览器工作流（Zhou et al. 2023），以及仿照工具使用评测的结构化 API 任务。每个实例都有二元成功标准，以及 token 和工具成本。为使比较聚焦，每个条件都使用相同的冻结 70B 指令微调模型，温度设为 0.2。

## 条件

我们按累积方式启用组件：单轮提示（Base）、结构化规划（Plan）、带类型工具（Tools）、工作记忆（Memory）、可执行验证（Verify），以及带有界重试策略的恢复（Full）。规划器和验证器使用与执行器相同的模型权重。不进行额外微调。

| 任务族   | Base | Plan | Tools | Memory | Verify |     Full |
|:--------------|-----:|-----:|------:|-------:|-------:|---------:|
| 仓库编辑     | 18.0 | 24.5 |  39.2 |   45.8 |   57.1 | **68.9** |
| 浏览器       | 22.7 | 29.4 |  43.5 |   49.1 |   55.6 | **64.8** |
| API 工作流  | 23.5 | 31.8 |  51.6 |   54.2 |   62.7 | **72.4** |
| 宏平均       | 21.4 | 28.6 |  44.8 |   49.7 |   58.5 | **68.7** |

启用 harness 组件时的成功率（%）。数值来自旨在隔离系统效应的模拟受控研究。

## 指标

我们报告任务成功率、归一化成本（模型 token 加工具延迟），以及恢复率：在重试预算内修复最初失败轨迹的比例。由于数值仅用于说明，故省略置信区间；我们给出协议，以便实践者使用真实模型复现比较。

# 结果

表 1 展示了随着循环获得行动和反馈能力，性能单调提升。在 API 任务上，带类型工具带来最大的单次跃升；而在仓库编辑中，验证和恢复最为重要，因为看似合理的补丁并不等于通过测试的补丁。在参数数量不变的情况下，完整 harness 相比单轮基线带来了 $3.2\times$ 的相对提升。

| 配置       |  成功率 |           成本 | 典型失败      |
|:--------------------|---------:|---------------:|:---------------------|
| Full                | **68.7** | 1.00$\times$ | –                    |
| $-$ 验证器      |     55.1 | 0.86$\times$ | 看似合理但已损坏 |
| $-$ 记忆        |     60.4 | 0.93$\times$ | 重复工作        |
| $-$ 带类型工具   |     48.9 | 1.08$\times$ | 无效调用        |
| $-$ 恢复      |     57.8 | 0.74$\times$ | 过早放弃      |
| $-$ 预算策略 |     62.0 | 1.37$\times$ | 无尽乐观     |

完整 harness 的宏平均消融。移除一个组件会暴露出相应的典型失败模式。

## 具备能力的代价

能力并非没有代价。Full 条件使用的 token 数是 Base 的 1.37$\times$，并且每个成功任务平均发起 2.8 次工具调用。然而，每个成功任务的成本下降了 41%，因为更少的尝试会以不可恢复的状态终止。这是一个系统层面的结果：一条更长的轨迹可能比一个简短但错误的答案更便宜。

## 扩展 harness

图 2 总结了模拟中观察到的一条定性扩展规律。当模型无法理解工具输出时，增益会趋于饱和；当 harness 提供结构化观测和有针对性的检查后，增益又会继续增长。因此，曲线取决于接口的两端；围绕一个无能力的执行器构建精巧 harness，大多只会产出精巧的轨迹。

![说明性 harness 扩展曲线](https://github.com/yexca/picx-images-hosting/raw/master/2026/09-harness-is-all-you-need/scaling.svg)

*图 2：说明性 harness 扩展曲线。深度表示启用的反馈接口数量，而非模型层数。*

# 讨论

## harness 为什么会放大能力

模型提供通用启发式方法；harness 提供反复应用这些方法的机会。三个机制解释了大部分增益：

1.  **信息增益。** 检索和观测揭示初始提示中没有的事实。

2.  **可行动性。** 工具让中间决策可以在环境中接受测试。

3.  **错误纠正。** 验证器把静默错误转化为观测，从而改变下一步。

这些机制类似于近期智能体工作中报告的分解与反思策略（Yao et al. 2023；Wang et al. 2024）。因此，harness 是一个关于策略的策略：它决定执行器看到哪些上下文、哪些动作合法，以及何时轨迹已经足够好。

## 控制理论视角

在部分可观测条件下，harness 维护一个关于任务进展的信念状态 $b_t$。一个简单的调度器为
$$
b_{t+1}=F(b_t,o_{t+1}),\qquad a_t=\arg\max_{a\in A(b_t)} Q(b_t,a),
$$
其中 $A(b_t)$ 经过权限和预算筛选。执行器用语言近似 $Q$。这一视角说明，停止是一个学习得到的系统决策，而不是格式选择。

## 失败模式

harness 也可能放大错误行为。提示注入会污染检索到的上下文；过于宽松的路由器会把幻觉变成破坏性动作；过度自信的验证器会为损坏的产物盖章。长轨迹还会造成可观测性悖论：更多日志有助于诊断，却可能挤占下一次决策所需的证据。因此，稳健系统应记录一切、选择性展示，并在检查结果不一致时默认拒绝。

# 相关工作

我们的框架连接了多条研究路线。Transformer 奠定了主流神经序列骨干（Vaswani et al. 2017）；扩展研究表明，能力可以随着模型规模和数据增长而涌现（Brown et al. 2020；Wei et al. 2022）。ReAct 交错进行推理与行动（Yao et al. 2023），Toolformer 学习调用 API（Schick et al. 2023），Reflexion 在多次尝试之间加入语言反馈（Shinn et al. 2023）。检索增强生成将记忆与参数分离（Lewis et al. 2020）。近期的编码智能体基准和开放运行时使系统层变得可度量（Jimenez et al. 2024；Wang et al. 2024）。我们为这些组成部分提供共同词汇，并提出一个衡量其联合效果的明确指标。

# 局限性与负责任使用

数值研究是有意设计的模拟，不应被解读为对任何特定商业系统的声明。真实评测必须报告任务抽样、不同随机种子下的方差、工具失败和人工升级情况。Harness 也扩大了攻击面：凭据、文件系统访问和浏览器会话需要最小权限策略与可审计轨迹。我们建议在发布模型检查点的同时发布 harness 规格，以便比较衡量完整系统。

# 结论

当运行时赋予语言模型状态、工具、反馈以及继续下去的理由时，语言模型就变成了智能体。由此产生的能力属于 $(\mathcal{M},H)$ 这一对，而不只属于权重。这一视角指向一项实用的研究计划：分别对 harness 组件进行基准测试，标准化接口，并衡量可靠完成任务的成本。标题中的妙语依然成立。在智能体系统中，harness 不是脚注；循环就存在于其中。

# 致谢

作者感谢让循环不至于无限旋转的工程师、按下红色按钮的评估人员，以及那些反馈智能体“差一点就对了”的用户。

# Harness 参考伪代码

以下伪代码概括了说明性研究所使用的运行时。

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

# Harness 检查清单

为了可复现的智能体实验，我们建议报告：上下文编译器和截断规则；工具模式、权限及时限；状态序列化和记忆保留策略；验证器实现及其误报率；重试和停止策略；token、挂钟时间和外部动作预算；以及具有代表性的失败轨迹。这些细节往往比一行模型名称更能预测观测到的行为。

# 参考文献

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
