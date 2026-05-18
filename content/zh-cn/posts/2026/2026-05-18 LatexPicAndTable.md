---
slug: 279
title: 'Latex 图片与表格'
# draft: true
author: yexca
date: '2026-05-18T20:53:11+09:00'
categories:
    - 学术探索
tags:
    - LaTeX
---

## 图片

在导言区加入如下代码，其中第二行设置默认图片放在 `img/` 文件夹内

```latex
% Image
\usepackage{graphicx}
\graphicspath{{img/}} % set default path to img/
```

具体使用

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{example.jpg}
    \caption{caption}
    \label{fig:label}
\end{figure}
```

其中 `htbp` 分别指代

- `h`：当前位置
- `t`：top 顶部
- `b`：bottom 底部
- `p`：page 新页面

在图片的前方 `[width=0.8\textwidth]` 指代宽度为一行的 0.8 倍，`caption` 为图片下方的描述，`label` 方便引用，具体为

```latex
可以参考图\ref{fig:label}
```

### 并排排列图片

如果不需要给每个图片都加入标题，可以直接简易排列

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.45\textwidth]{image1.jpg}
    \hspace{0.05\textwidth} % 间隔
    \includegraphics[width=0.45\textwidth]{image2.jpg}
    \caption{两张图片并排，共用一个标题}
\end{figure}
```

如果需要并排排列，可以使用 `minipage`

```latex
\begin{figure}[htbp]
    \centering
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=\textwidth]{pic1.png}
        \caption{pic1 description}
        \label{fig:pic1}
    \end{minipage}
    \hfill
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=0.4\textwidth]{pic2.png}
        \caption{pic2 description}
        \label{fig:pic2}
    \end{minipage}
\end{figure}
```

## 表格

在导言区加入

```latex
\usepackage{tabularx} % add table
\usepackage{booktabs} % table function \toprule, \midrule, \bottomrule
```

表格构成

```latex
\begin{table}[htbp]
\small
\centering
\begin{tabularx}{\textwidth}{l|l|X}
\toprule
\textbf{title1} & \textbf{title2} & \textbf{title3} \\
\midrule
content1-1 & content1-2 & content1-3 \\
\cmidrule{2-3}
        & content2-2 & content2-3 \\
\midrule
content3-1 & content3-2 & content3-3 \\
\bottomrule
\end{tabularx}
\end{table}
```

其中使用 `\midrule` 去画一行所有列的线，使用 `\cmidrule` 去画一行部分列的线，例子中 `\cmidrule{2-3}` 表示只画一行中第二列到第三列的线
