---
slug: 76
title: '仮想マシンでのArch Linuxインストール記録'
date: '2022-10-02T13:39:26+08:00'
author: yexca
# layout: post
# permalink: /archives/76
views:
    - '260'
categories:
    - 技術学習
tags:
    - Arch Linux
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## はじめに

仮想マシンにインストールするよ。使ったソフトはFedoraの「ボックス」だね。

## インストール前の準備

### イメージのダウンロード

[公式ダウンロードページ](https://archlinux.org/download/)からダウンロードしてね。BTダウンロード（正規のtorrentクライアント、例えば[qBittorrent](https://www.qbittorrent.org/)を使ってね）がおすすめだよ。

ダウンロードしたら、仮想マシンに入れるんだ。

### 起動モードの確認

efivarsディレクトリをリスト表示してみて。

```bash
ls /sys/firmware/efi/efivars
```

もしディレクトリがちゃんと表示されてエラーが出なければ、システムはUEFIモードで起動してるってこと。ディレクトリがなければ、たぶん[BIOS](https://ja.wikipedia.org/wiki/BIOS)モード（もしくはCSMモード）で起動してるんだ。

この仮想マシンではBIOSモードを使ったよ。

### インターネット接続

ネットワークインターフェースとDHCPサービスはデフォルトでオンになってるから、設定は特にいらないよ。

### システム時刻の更新

ネットワークタイムサーバー（NTP）との同期を有効にするよ。

```bash
timedatectl set-ntp true
```

`timedatectl status`コマンドでサービスの状態を確認できるよ。

### ハードディスクのパーティション作成

伝統的な`fdisk`コマンドでパーティションを作成したよ（MBRパーティション）。起動がBIOSだから、公式のパーティション例に倣って、2つのパーティション（swap領域とその他）だけ作ったんだ。

`fdisk -l`を使ってすべてのディスクをリスト表示してみてね（rom、loop、airootで終わるデバイスは無視してOK）。

`fdisk /dev/デバイス名`でパーティションの作成を開始するよ。

| コマンド | 説明           |
| -------- | -------------- |
| n        | 新しいパーティションを作成 |
| p        | パーティションの確認     |
| t        | パーティションタイプを変更 |
| w        | 変更を保存       |

パーティションサイズを指定するときは `+`+`num`+`K/M/G/T/P` を使うよ。もしサフィックス（`K/M/G/T/P`）がなければセクタ単位で割り当てられるんだ。

### パーティションのフォーマット

* スワップ領域の作成

```bash
mkswap /dev/スワップ領域のパーティション
```

* ファイルシステムの作成

ファイルシステムによってコマンドが違うよ。例えばext4ファイルシステムならこれ。

```bash
mkfs -t ext4 /dev/パーティション
```

### パーティションのマウント

ルートパーティションを`/mnt`にマウントするよ。もし複数のパーティションがある場合は、まずルートパーティションをマウントすることを忘れないでね。

```bash
mount /dev/パーティション /mnt
```

スワップ領域を有効にするよ。

```bash
swapon /dev/スワップ領域のパーティション
```

## インストール

### ミラーの選択

ファイル`/etc/pacman.d/mirrorlist`には、どこからパッケージをダウンロードするかが定義されてるんだ。インターネットに接続すると自動で更新されるし、手動で変更することもできるけど、僕は変更しなかったよ。

### パッケージのインストール

pacstrapスクリプトを使って、baseパッケージとLinuxカーネル、それにvimをインストールするよ。もし他のパッケージもインストールするなら、下のコマンドの後に名前を追加すればいいんだ。もちろん、後でpacmanを使ってインストールすることもできるよ。

```bash
pacstrap /mnt base linux vim
```

## システム設定

### Fstab

`/etc/fstab`ファイルは、システム起動時にパーティションをどのように自動マウントするかを記述しているんだ。以下のコマンドで自動生成できるよ（`-U`または`-L`オプションでUUIDやボリュームラベルを設定して、UUIDを使うことでシステム起動時にエラーが出ないようにするんだ）。

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

自動設定が正しいか確認してね。

```bash
cat /mnt/etc/fstab
```

### Chroot

新しくインストールしたシステムにchrootするよ。

```bash
arch-chroot /mnt
```

### タイムゾーン

上海時間を例にするね。

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

`/etc/adjtime`を生成するよ。

```bash
hwclock --systohc
```

この時点で`date`コマンドを使って時刻が正しいか確認できるよ。

### ロケール設定

`/etc/locale.gen`を編集して、`en_GB.UTF-8`のコメントアウトを外すんだ。

それからロケール情報を生成するよ。

```bash
locale-gen
```

`/etc/locale.conf`ファイルを作成して、LANG変数を編集してね。例えば`LANG=en_GB.UTF-8`って感じ。

### ネットワーク設定

`/etc/hostname`ファイルを作成してホスト名を入力するよ。

仮想マシンはDHCPを使ってるから、[ネットワーク設定](https://wiki.archlinux.jp/index.php/%E3%83%8D%E3%83%83%E3%83%88%E3%83%AF%E3%83%BC%E3%82%AF%E8%A8%AD%E5%AE%9A)は特にしなかったよ。

### Rootパスワード

```bash
passwd
```

### ブートローダーのインストール

だいたいGRUBをインストールするよね。僕が使った仮想マシンはBIOS+MBRだったから、grubパッケージをインストールしたよ。

```bash
pacman -S grub
```

grubをインストールするよ（下のコマンドの`/dev/デバイス`はパーティションじゃないから注意してね）。

```bash
grub-install --target=i386-pc /dev/デバイス
```

設定ファイルを生成するよ。

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

## 再起動

`exit`か`Ctrl+D`でchroot環境から出るんだ。

`umount -R /mnt`でマウントされたパーティションをアンマウントするよ。

再起動は `reboot` でね。

## 参考資料

[インストールガイド (日本語) - ArchWiki](https://wiki.archlinux.jp/index.php/%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%82%AC%E3%82%A4%E3%83%89)
