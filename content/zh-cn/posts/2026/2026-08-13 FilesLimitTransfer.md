---
slug: 290
title: '受限环境下文件复制与远程传输'
# draft: true
author: yexca
date: '2026-08-13T19:01:11+09:00'
categories:
    - 开发实践
tags:
    - scp
---

自从知道 `scp` 命令后，从本地向服务器传输文件我已经很少使用 FTP 服务或者其他奇奇怪怪的操作了，不过最近由于需要传输一个较大的文件，因为传输时间较长，害怕中断导致损坏于是我开始其他解法，在此过程中管道的概念让我想到了之前折腾 openwrt 的时候遇到的操作，遂写此文

## 远程传输

文件传输可以通过指定 scp 算法以提高速度，比如使用 AES128-GCM 算法

```bash
scp -c aes128-gcm@openssh.com /path/to/local/file user@remote:/path/to/dir
```

当然，事实上有改良的同样基于 SSH 传输文件的 rsync 传输效率会更高，但是缺点是有些系统原生不支持 (Windows 也不支持)

```bash
rsync -avzP -e "ssh -c aes128-gcm@openssh.com" /path/to/local/file user@remote:/path/to/dir
```

不过最快的方法是通过管道传输，这也是本文的灵感来源

```bash
tar -cf - /path/to/dir | ssh user@remote "tar -xf - -C /path/to/remote/dir"
```

## 受限环境传输

之前折腾 OpenWRT 的时候，遇到了当时让我很震惊的备份文件命令 `cat /dev/mtdblock0 > /tmp/BL2.bin` ~~仿佛看到了原子弹爆炸，让我瘫坐眩晕了~~

但是实际尝试复制文件后，出现前后的 SHA1 值不同的原因就没有使用过。这次查询了下原因大概可能是

- Windows 和 Linux 的文本换行符不同导致的文件损坏。其中 Linux 为 `\n` 而 Windows 为 `\r\n` 在部分 shell 工具中可能会自动将输出进行转换为文本流从而引发错误
- 编码问题。由于将数据文件转换为文本流，进行了文本处理操作，自动将编码改为了比如 UTF-16

不过还是有些方法以避免这些问题的

### Cat and ssh

```bash
# 从本地传到远程
cat local_bin | ssh user@remote "cat > /tmp/remote_bin"

# 从远程拉到本地
ssh user@remote "cat /tmp/remote_bin" > local_bin
```

### Base64

如果直接传输二进制会被截断，可以使用 base64 算法将文件转换为文本流然后传输

```bash
# 1. 本地转成纯文本
base64 local_bin > bin.txt

# 2. 把 bin.txt 内容复制粘贴到受限终端，写入 remote.txt

# 3. 远程解密恢复成二进制
base64 -d remote.txt > /tmp/remote_bin
```

### Hex

如果受限终端甚至没有 base64 的话，可以通过十六进制转换进行传输

```bash
# 本地生成 Hex
xxd -p local_bin > bin.hex

# 传输

# 远程还原
xxd -r -p bin.hex > /tmp/remote_bin
```

---

在最极端的传输环境下，只能使用 printf 或者 `echo -ne` 打印输入文件

```bash
printf '\x7f\x45\x4c\x46\x02\x01...' > /tmp/remote_bin
```

这些转换后的文件可能会缺失了执行权限，所以在传输完成后需要增加相应的权限

```bash
chmod +x /tmp/remote_bin
```

当然如果双方架构不匹配的话，这样传输过去的二进制文件也是无法执行的 (X86 和 ARM)

### 参考文章

<https://openwrt.org/toh/xiaomi/redmi_ax6000>
