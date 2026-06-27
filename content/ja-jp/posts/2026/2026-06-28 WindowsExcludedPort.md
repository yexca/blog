---
slug: 288
title: 'Windows 保留ポートの除外'
# draft: true
author: yexca
date: '2026-06-28T02:00:40+09:00'
categories:
    - 開発実践
tags:
    - Windows
---

{{< notice >}} この記事は gemini-3.5-flash によって翻訳されました {{< /notice >}}

サービスを起動する際、ポートが占有されているというエラーが時々発生することがあります。しかし、実際に `netstat -ano | findstr :[prot]` で確認しても、そのポートを占有しているプログラムが見つからないことがあります。これは通常、Windows の「保留ポート（除外ポート）」として占有されているためです。

> プログラムが占有している場合は、`taskkill` コマンドを使用してプロセスを終了できます。

通常は別のポートに変更すれば解決しますが、特定のポートを自分でコントロールしたい場合は、Windows がそれらのポートを保留ポートとして使用しないように設定する必要があります。

## 保留ポートの確認

管理者権限で cmd または PowerShell を開き、以下のコマンドを実行して確認します。

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

このコマンドにより、現在保留されているすべてのポート範囲が表示されます。

## ランダムな更新

パソコンを再起動するたびにポートはランダムに更新されますが、再起動せずに以下のコマンドでサービスを再起動することでもポートを更新できます。

```powershell
net stop winnat
net start winnat
```

その後、使用したいポートがまだ占有されているかどうかを再度確認します。

## 除外ルールの追加

ただし、お気に入りのポートを安定して使用するためには、除外ルールを追加するのが最も確実です。まず、WinNAT サービスを停止します。

```powershell
net stop winnat
```

次に、使用したいポート番号を指定（除外登録）します。

```powershell
netsh int ipv4 add excludedportrange protocol=tcp startport=7650 numberofports=10
```

このコマンドは、7650 から始まる 10 個のポート（つまり 7650〜7659）を除外します。その後、WinNAT サービスを再起動します。

```powershell
net start winnat
```

## 除外ルールの削除

使用しなくなった場合は、同様にまずサービスを停止し、以下のコマンドを実行します。

```powershell
netsh int ipv4 delete excludedportrange protocol=tcp startport=7650 numberofports=10
```

最後にサービスを再起動すれば完了です。

## 原因

この問題が発生する根本的な原因は、通常 Windows で Hyper-V や WSL2 が有効になっていることです。Windows は WinNAT というサービスを利用して、これらの仮想マシンやコンテナに対して動的ポート範囲としてポートを動的に割り当てます。

厄介なことに、この範囲は通常非常に広く（例えば 1024 から 50000 まで及ぶこともあります）、さらにパソコンを再起動するたびにランダムに割り当てられます。そのため、「昨日まで使えていたポートが、今日はシステムに占有されて使えなくなる」といった現象が発生します。