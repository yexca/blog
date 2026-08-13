---
slug: 290
title: '制限環境でのファイルコピーとリモート転送'
# draft: true
author: yexca
date: '2026-08-13T19:01:11+09:00'
categories:
    - 開発実践
tags:
    - scp
---

{{< notice >}} この記事は deepseek-v4-flash によって翻訳されました {{< /notice >}}

`scp` コマンドを知って以来、ローカルからサーバーへのファイル転送にFTPサービスや他の変な操作を使うことはほとんどなくなりました。しかし最近、大きなファイルを転送する必要があり、転送時間が長いため中断による破損を恐れて、他の解決策を探し始めました。その過程でパイプの概念が、以前OpenWrtをいじっていたときに遭遇した操作を思い出させたので、この記事を書きます。

## リモート転送

ファイル転送は、scpアルゴリズムを指定して速度を向上させることができます。例えば、AES128-GCMアルゴリズムを使用します。

```bash
scp -c aes128-gcm@openssh.com /path/to/local/file user@remote:/path/to/dir
```

もちろん、実際には改良された同じくSSHベースでファイルを転送するrsyncの方が転送効率は高いですが、一部のシステムではネイティブにサポートされていない（Windowsもサポートしていない）という欠点があります。

```bash
rsync -avzP -e "ssh -c aes128-gcm@openssh.com" /path/to/local/file user@remote:/path/to/dir
```

ただし、最速の方法はパイプ経由の転送です。これがこの記事のインスピレーションの源です。

```bash
tar -cf - /path/to/dir | ssh user@remote "tar -xf - -C /path/to/remote/dir"
```

## 制限環境での転送

以前OpenWRTをいじっていたとき、当時私をとても驚かせたバックアップファイルコマンド `cat /dev/mtdblock0 > /tmp/BL2.bin` に遭遇しました。~~まるで原爆の爆発を見たかのようで、座り込んでめまいがしました~~

しかし実際にファイルのコピーを試みた後、前後でSHA1値が異なる原因が分からず使っていませんでした。今回調べてみたところ、おそらく以下の理由が考えられます。

- WindowsとLinuxのテキスト改行コードの違いによるファイル破損。Linuxは`\n`、Windowsは`\r\n`であり、一部のシェルツールでは出力を自動的にテキストストリームに変換してしまい、エラーを引き起こす可能性があります。
- エンコーディングの問題。データファイルをテキストストリームに変換する際にテキスト処理が行われ、自動的にエンコーディングが例えばUTF-16に変更されてしまう。

しかし、これらの問題を回避する方法はいくつかあります。

### Cat and ssh

```bash
# 从本地传到远程
cat local_bin | ssh user@remote "cat > /tmp/remote_bin"

# 从远程拉到本地
ssh user@remote "cat /tmp/remote_bin" > local_bin
```

### Base64

バイナリを直接転送すると途中で切れる可能性があります。base64アルゴリズムを使ってファイルをテキストストリームに変換してから転送できます。

```bash
# 1. 本地转成纯文本
base64 local_bin > bin.txt

# 2. 把 bin.txt 内容复制粘贴到受限终端，写入 remote.txt

# 3. 远程解密恢复成二进制
base64 -d remote.txt > /tmp/remote_bin
```

### Hex

制限された端末にbase64すらない場合は、16進数変換で転送できます。

```bash
# 本地生成 Hex
xxd -p local_bin > bin.hex

# 传输

# 远程还原
xxd -r -p bin.hex > /tmp/remote_bin
```

---

最も極端な転送環境では、printfまたは`echo -ne`で入力ファイルを出力するしかありません。

```bash
printf '\x7f\x45\x4c\x46\x02\x01...' > /tmp/remote_bin
```

これらの変換後のファイルは実行権限が失われている可能性があるため、転送完了後に適切な権限を追加する必要があります。

```bash
chmod +x /tmp/remote_bin
```

もちろん、両者のアーキテクチャが一致しない場合、こうして転送したバイナリファイルも実行できません（X86とARM）。

### 参考記事

<https://openwrt.org/toh/xiaomi/redmi_ax6000>