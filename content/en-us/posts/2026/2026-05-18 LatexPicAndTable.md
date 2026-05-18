---
slug: 279
title: 'LaTeX Figures and Tables'
# draft: true
author: yexca
date: '2026-05-18T20:53:11+09:00'
categories:
    - Academic Exploration
tags:
    - LaTeX
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Figures

Add the following code to your preamble. The second line sets the default image path to the `img/` folder.

```latex
% Image
\usepackage{graphicx}
\graphicspath{{img/}} % set default path to img/
```

Standard usage:

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{example.jpg}
    \caption{caption}
    \label{fig:label}
\end{figure}
```

The `htbp` parameters stand for:

- `h`: here (current position)
- `t`: top
- `b`: bottom
- `p`: page (new page)

The `[width=0.8\textwidth]` setting makes the image 80% of the line width. The `caption` is the description below the figure, and the `label` is for cross-referencing:

```latex
Refer to Figure \ref{fig:label}
```

### Side-by-Side Figures

If you don't need individual captions for each image, you can arrange them simply:

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.45\textwidth]{image1.jpg}
    \hspace{0.05\textwidth} % spacing
    \includegraphics[width=0.45\textwidth]{image2.jpg}
    \caption{Two images side-by-side sharing one caption}
\end{figure}
```

If you need separate captions for each, use `minipage`:

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

## Tables

Add these to your preamble:

```latex
\usepackage{tabularx} % add table
\usepackage{booktabs} % table function \toprule, \midrule, \bottomrule
```

Table structure:

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

Use `\midrule` to draw a line across all columns. Use `\cmidrule` for specific columns; for example, `\cmidrule{2-3}` draws a line only from the second to the third column.