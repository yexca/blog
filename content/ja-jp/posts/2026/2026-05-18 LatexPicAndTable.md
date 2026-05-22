---
slug: 279
title: 'LaTeX の画像と表'
# draft: true
author: yexca
date: '2026-05-18T20:53:11+09:00'
categories:
    - 学術探究
tags:
    - LaTeX
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

## 画像

プリアンブルに次のコードを追加してね。2行目は、デフォルトの画像を `img/` フォルダに置く設定だよ。

```latex
% Image
\usepackage{graphicx}
\graphicspath{{img/}} % set default path to img/
```

具体的な使い方はこんな感じ。

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.8\textwidth]{example.jpg}
    \caption{キャプション}
    \label{fig:label}
\end{figure}
```

ここで `htbp` はそれぞれ次の場所を指しているよ。

- `h`：現在位置 (here)
- `t`：上部 (top)
- `b`：下部 (bottom)
- `p`：新しいページ (page)

画像の設定にある `[width=0.8\textwidth]` は幅を一行の0.8倍にするという意味で、`caption` は画像の下に表示される説明、`label` は引用する時に便利だよ。具体的にはこうやって引用するんだ。

```latex
図\ref{fig:label}を参考にしてね。
```

### 画像を並べて配置する

もし各画像に個別のキャプションが必要ないなら、こんな風にシンプルに並べることができるよ。

```latex
\begin{figure}[htbp]
    \centering
    \includegraphics[width=0.45\textwidth]{image1.jpg}
    \hspace{0.05\textwidth} % 間隔
    \includegraphics[width=0.45\textwidth]{image2.jpg}
    \caption{2枚の画像を並べて、1つのキャプションを共有する}
\end{figure}
```

個別にキャプションを付けて並べたい場合は、`minipage` を使うといいよ。

```latex
\begin{figure}[htbp]
    \centering
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=\textwidth]{pic1.png}
        \caption{pic1 の説明}
        \label{fig:pic1}
    \end{minipage}
    \hfill
    \begin{minipage}{0.45\textwidth}
        \centering
        \includegraphics[width=\textwidth]{pic2.png}
        \caption{pic2 の説明}
        \label{fig:pic2}
    \end{minipage}
\end{figure}
```

## 表

プリアンブルにこれを追加してね。

```latex
\usepackage{tabularx} % 表の追加
\usepackage{booktabs} % \toprule, \midrule, \bottomrule などの機能
```

表の構成はこんな感じ。

```latex
\begin{table}[htbp]
\small
\centering
\begin{tabularx}{\textwidth}{l|l|X}
\toprule
\textbf{タイトル1} & \textbf{タイトル2} & \textbf{タイトル3} \\
\midrule
コンテンツ1-1 & コンテンツ1-2 & コンテンツ1-3 \\
\cmidrule{2-3}
        & コンテンツ2-2 & コンテンツ2-3 \\
\midrule
コンテンツ3-1 & コンテンツ3-2 & コンテンツ3-3 \\
\bottomrule
\end{tabularx}
\end{table}
```

ここで、`\midrule` はすべての列に横線を引く時に使って、`\cmidrule` は一部の列だけに線を引く時に使うよ。例にある `\cmidrule{2-3}` は、2列目から3列目だけに線を引くという意味なんだ。