---
slug: 18
title: Xshellを使って仮想マシンのCentOS 7に接続する方法
date: '2021-12-26T15:34:59+08:00'
author: yexca
# layout: post
# permalink: /archives/18
views:
    - '357'
categories:
    - 技術学習
tags:
    - Xshell
    - CentOS
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

注意：この方法は一時的な接続だよ。仮想マシンを再起動したりシャットダウンしたりすると、また再設定が必要になるから気をつけてね。

## 仮想マシンのネットワークアダプター設定

仮想マシンのネットワークアダプターには、主に3つの設定があるんだ。

- ブリッジモード：ホストマシンと同じネットワークセグメントを使うモード。
- NATモード：VMware Network Adapter VMnet8 のネットワークセグメントを使うモード。
- ホストオンリーモード：VMware Network Adapter VMnet1 のネットワークセグメントを使うモード。

## IPセグメントを確認しよう

VMwareの左上にある「編集 -> 仮想ネットワークエディター」を開くと、VMnet1とVMnet8に対応するセグメントのアドレス（サブネットアドレス）が確認できるよ。

ブリッジモードのセグメントを確認するには、「設定 -> ネットワークとインターネット -> ネットワークの詳細設定」から、実際に接続されているホストマシンのネットワークを探してね。

- WiFiを使っているなら、「Wi-Fi -> プロパティを表示」でIPアドレスが見れるよ。
- 有線（LAN）を使っているなら、「イーサネット -> プロパティを表示」でIPアドレスが見れるよ。

注意：もしホストマシンが有線とWiFiの両方に繋がっているなら、VMwareの「仮想ネットワークエディター」で関連する設定が必要になるかもしれない。

VMwareを管理者権限で実行して、画像のようにVMwareで使いたいネットワークカードを選択してね。

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/vmware-网卡.6pvdvehvzz40.webp)

## 仮想マシンのIPアドレスを設定する

注：僕はブリッジモードを使っているよ。僕のホストマシンのIPが 192.168.1.116 だから、仮想マシンには 192.168.1.0 〜 192.168.1.255 の範囲内で、192.168.1.116 以外のアドレスを自由に割り当てられるんだ。つまり、最初の3つの数字を同じにして、最後の数字だけ変えればいいってことだね。

まずは仮想マシンを起動して root ユーザーでログインし、「ifconfig」コマンドでネットワークカードの設定を確認しよう。

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置.56i9yy8tjfo0.webp)

もし画像のように「ens33」と「lo」、あるいは「その他」と「lo」が表示されたら、

次のコマンドを入力してね：

```bash
# ifconfig デバイス名（この例では "ens33"） 割り当てたいアドレス（ここでは 192.168.1.110 を選択）
ifconfig ens33 192.168.1.110
```

もし「lo」しか表示されない場合は、

次のコマンドを入力してね：

```bash
# ifconfig デバイス名（一般的には "eth0"） 割り当てたいアドレス（ここでは 192.168.1.110 を選択）
ifconfig eth0 192.168.1.110
```

設定が終わったら、もう一度「ifconfig」コマンドを入力して確認してみよう。

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置-2.2fy0k801s03.webp)

上の画像みたいに、IPが 192.168.1.110 に無事変わっていればOK。

Windowsのターミナルを開いて、「ping 192.168.1.110」と入力して、ちゃんと繋がるか試してみて。

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/ping-连接.5un7zgka3b00.webp)

こんな感じで返ってくれば、IPの変更が成功してアクセスできる状態だよ。

## Xshellで接続する

Xshellを開いて「新規」をクリック。名前は好きなもので大丈夫。ホストの欄にさっきのIPを入力して「接続」をクリックしてね。

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接界面.7jwpta0nork0.webp)

「受け入れて保存」を選んで、あとは画面の指示に従ってユーザー名（root）とパスワードを入力すれば完了！

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接成功.752g8y4vdsg0.webp)
