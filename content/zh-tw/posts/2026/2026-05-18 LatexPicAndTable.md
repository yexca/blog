---
slug: 279
title: 'LaTeX 圖片與表格'
# draft: true
author: yexca
date: '2026-05-18T20:53:11+09:00'
categories:
    - 學術探索
tags:
    - LaTeX
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 圖片

在導言區加入如下程式碼，其中第二行設定預設圖片放在 `img/` 資料夾內：

```latex
% Image
\usepackage{graphicx}
\graphicspath{{img/}} % 設定預設路徑為 img/
```

具體使用方式：

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{example.jpg}
    \caption{標題}
    \label{fig:label}
\end{figure}
```

其中 `htbp` 分別代表：

- `h`：目前位置 (here)
- `t`：頂部 (top)
- `b`：底部 (bottom)
- `p`：新頁面 (page)

在圖片的前方 `[width=0.8\textwidth]` 代表寬度為一列的 0.8 倍，`caption` 為圖片下方的描述標題，`label` 方便引用，具體用法為：

```latex
可以參考圖\ref{fig:label}
```

### 並排排列圖片

如果不需要幫每張圖片都加上標題，可以直接簡單排列：

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.45\textwidth]{image1.jpg}
    \hspace{0.05\textwidth} % 間隔
    \includegraphics[width=0.45\textwidth]{image2.jpg}
    \caption{兩張圖片並排，共用一個標題}
\end{figure}
```

如果需要各自擁有標題並排排列，可以使用 `minipage`：

```latex
\begin{figure}[htbp]
    \centering
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=\textwidth]{pic1.png}
        \caption{pic1 描述}
        \label{fig:pic1}
    \end{minipage}
    \hfill
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=\textwidth]{pic2.png}
        \caption{pic2 描述}
        \label{fig:pic2}
    \end{minipage}
\end{figure}
```

## 表格

在導言區加入：

```latex
\usepackage{tabularx} % 新增表格
\usepackage{booktabs} % 表格功能 \toprule, \midrule, \bottomrule
```

表格構成範例：

```latex
\begin{table}[htbp]
\small
\centering
\begin{tabularx}{\textwidth}{l|l|X}
\toprule
\textbf{標題1} & \textbf{標題2} & \textbf{標題3} \\
\midrule
內容1-1 & 內容1-2 & 內容1-3 \\
\cmidrule{2-3}
        & 內容2-2 & 內容2-3 \\
\midrule
內容3-1 & 內容3-2 & 內容3-3 \\
\bottomrule
\end{tabularx}
\end{table}
```

其中使用 `\midrule` 來畫出一整列所有欄位的橫線，使用 `\cmidrule` 來畫出該列中部分欄位的橫線，範例中 `\cmidrule{2-3}` 表示只畫出該列中第二欄到第三欄的線。