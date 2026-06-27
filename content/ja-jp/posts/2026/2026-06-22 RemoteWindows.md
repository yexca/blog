---
slug: 287
title: 'Windows PCをリモート操作する'
# draft: true
author: yexca
date: '2026-06-22T01:26:59+09:00'
categories:
    - やってみた
tags:
    - RDP
    - Windows
    - VS Code
---

{{< notice >}} この記事は gemini-3.5-flash によって翻訳されました {{< /notice >}}

最近、自分のPCでモデルのトレーニング（学習）を走らせている間、他の作業がまったくできなくなっちゃって。自分のMacやLinuxデバイスを使っても、それらは別の用途があるからなんとなく使いにくくてね。そこで、研究室のPCを活用しようと思いついたんだ。準備が整ったらあっちでトレーニングを走らせて、自分は手元のマシンで別の作業を続けられるようにね。

ちょっと調べてみて、より確実に接続できるように3つの方法を併用することにしたよ。まずはMicrosoft公式のRDP、次にVS Codeのリモート開発、そして最後のバックアップとしてChromeのリモートデスクトップだ。

## Tailscale

RDPやVS Codeのターミナルを使うには、同じローカルネットワーク（LAN）を構築するか、操作される側のPC（ホストPC）がパブリックインターネットに公開されている必要があるんだ。でも、自分のサーバーにイントラネット貫通（ポートフォワーディング等）を仕掛けると、環境が汚れるリスクがあるよね。だから、今回は仮想ローカルネットワーク（VLAN/VPN）を使うことにした。

そこで、Tailscaleを使って仮想ローカルネットワークを構築することに。Windowsでは、[公式サイト](https://tailscale.com)からダウンロードしてインストールすればOK。Macならbrewを使ってインストールできるよ：`brew install --cask tailscale`

インストールが終わったら、同じアカウントでログインするだけ。ホストPC側で「Run unattended」を有効にしておけば、PCが再起動してまだデスクトップにログインしていない状態でもネットワークが繋がるから安心だよ。

## RDP

まず注意点として、この機能はWindows Homeエディションでは使えないんだ。設定は「設定 -> システム -> リモート デスクトップ」からオンにする必要があるよ。

次に、MacのApp Storeから「Windows App」をインストール。あとはホストPCのIPアドレスとユーザー名を入力すれば接続完了だ。

## VS Code - SSH

これを使うには、ホストのWindows側でOpen SSH機能を有効にする必要があるよ。具体的には「設定 -> システム -> オプション機能」から「OpenSSH サーバー」を検索して追加するんだ。

Homeエディションだと表示されないことがあるから、その場合は管理者権限のPowerShellを開いてコマンドでインストールしよう。

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

インストールが終わったら、インストール状態を確認するよ。

```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'
```

もし `State` が `Installed` になっていればインストールは成功。そのまま起動して、自動起動（PC起動時に自動で立ち上がるよう）に設定しよう。

```powershell
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

もし `State` が `Staged` のままだとインストールがうまくいっていない。一旦Windowsを再起動してから状態を確認してみて、それでもダメなら一旦アンインストールして、最初からやり直してみよう。

```powershell
Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

実は、僕がインストールしたときは以下のようなエラーが出ちゃったんだ。

```markdown
Add-WindowsCapability: The Component store has been corrupted.
```

このエラーはWindowsのコンポーネントストアが破損していることを示しているから、まずはシステムイメージをチェックする。

```powershell
DISM /Online /Cleanup-Image /CheckHealth
```

出力結果に「Repairable」と表示されたら、自動修復を実行しよう。

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
```

自動修復が終わったら、PCを再起動してもう一度インストールを試せばOK！

---

SSHサービスが正常に起動したら、操作する側のPCでVS Codeを開いて「Remote Development」拡張機能をインストールする。

インストール完了後、`Ctrl/Cmd + Shift + P` を押して `Remote-SSH: Connect to Host...` を選択し、新しいホストを設定する。接続コマンドに `ssh username@100.x.x.x` （ホストPCのユーザー名とTailscaleのIPアドレス）を入力して、コンポーネントのインストールが終わるのを待てば完了だよ。

## VS Code - Tunnel

もしSSHの設定がどうしても上手くいかない場合は、VS Codeの「Remote Tunnels」機能を使えば、SSHの設定なしで接続できるよ。Homeエディションのユーザーなら、Tailscaleを入れて仮想ネットワークを構築する必要すらなくなっちゃう。

使うには、お互いに同じGitHubアカウントでログインする必要がある。まずはホストPCのVS CodeでGitHubアカウントにログインして、左下のプロフィールアイコンをクリックするかコマンドパレットから「Turn on Remote Tunnel Access（リモート トンネル アクセスをオンにする）」を選択。「Install as a service（サービスとしてインストール）」を選んで、指示に従って完了を待とう。

完了後、ログの最後にアクセス用URLが表示される。そのURLにアクセスしてGitHubにログインすればブラウザからでも使えるよ。

または、操作する側で「Remote - Tunnels」拡張機能をインストールしてから、コマンドパレットで「Remote-Tunnels: Connect to Tunnel」を入力して、同じGitHubアカウントにログインしても接続できるよ。

## Chrome

これはめちゃくちゃ手軽だよ。Chromeでウェブサイト <https://remotedesktop.google.com/access> にアクセスして、Googleアカウントでログインした後、ホストPCでリモートアクセスの設定をオンにする。途中、拡張機能やアプリのインストールが必要だけど、画面の指示に従っていけば勝手に案内してくれるよ。

インストールが終わったら、他のPCのChromeから同じGoogleアカウントでログインして同じURLを開くだけで接続できちゃうんだ。