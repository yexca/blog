---
slug: 290
title: 'File Copying and Remote Transfer in Restricted Environments'
# draft: true
author: yexca
date: '2026-08-13T19:01:11+09:00'
categories:
    - Development Practices
tags:
    - scp
---

{{< notice >}} This article was translated by gemini-3.5-flash {{< /notice >}}

Ever since I learned about the `scp` command, I have rarely used FTP services or other strange workarounds to transfer files from my local machine to a server. However, recently I needed to transfer a relatively large file. Because the transfer time was long and I was afraid of corruption due to interruption, I started looking for other solutions. During this process, the concept of pipelines reminded me of an operation I encountered when playing around with OpenWrt, so I decided to write this article.

## Remote Transfer

File transfers can be sped up by specifying the scp algorithm, such as using the AES128-GCM algorithm:

```bash
scp -c aes128-gcm@openssh.com /path/to/local/file user@remote:/path/to/dir
```

Of course, in reality, `rsync` (which is also based on SSH for file transfer but improved) has higher transfer efficiency. However, the downside is that some systems do not support it natively (including Windows).

```bash
rsync -avzP -e "ssh -c aes128-gcm@openssh.com" /path/to/local/file user@remote:/path/to/dir
```

But the fastest method is transferring via pipelines, which is also the inspiration for this article:

```bash
tar -cf - /path/to/dir | ssh user@remote "tar -xf - -C /path/to/remote/dir"
```

## Transfer in Restricted Environments

When I was playing around with OpenWrt before, I encountered a backup file command that shocked me at the time: `cat /dev/mtdblock0 > /tmp/BL2.bin` ~~It felt like seeing an atomic bomb explode, leaving me slumped and dizzy.~~

However, after actually trying to copy files, I stopped using it because the SHA1 values before and after the transfer were different. I looked into the reasons this time, and it might be due to:

- File corruption caused by different text line endings between Windows and Linux. Linux uses `\n` while Windows uses `\r\n`. Some shell tools might automatically convert the output into a text stream, causing errors.
- Encoding issues. Converting data files into text streams and performing text processing operations might automatically change the encoding to something like UTF-16.

However, there are still some ways to avoid these problems.

### Cat and ssh

```bash
# Transfer from local to remote
cat local_bin | ssh user@remote "cat > /tmp/remote_bin"

# Pull from remote to local
ssh user@remote "cat /tmp/remote_bin" > local_bin
```

### Base64

If you transfer binary data directly, it might get truncated. You can use the base64 algorithm to convert the file into a text stream and then transfer it.

```bash
# 1. Convert to plain text locally
base64 local_bin > bin.txt

# 2. Copy and paste the contents of bin.txt into the restricted terminal, writing to remote.txt

# 3. Decrypt and restore to binary on the remote side
base64 -d remote.txt > /tmp/remote_bin
```

### Hex

If the restricted terminal doesn't even have base64, you can transfer it via hexadecimal conversion.

```bash
# Generate Hex locally
xxd -p local_bin > bin.hex

# Transfer

# Restore on the remote side
xxd -r -p bin.hex > /tmp/remote_bin
```

---

In the most extreme transfer environments, you can only use `printf` or `echo -ne` to print and input the file:

```bash
printf '\x7f\x45\x4c\x46\x02\x01...' > /tmp/remote_bin
```

These converted files might lose their execution permissions, so you need to add the corresponding permissions after the transfer is complete:

```bash
chmod +x /tmp/remote_bin
```

Of course, if the architectures of the two sides do not match, the binary files transferred this way will not be executable either (e.g., X86 and ARM).

### References

<https://openwrt.org/toh/xiaomi/redmi_ax6000>