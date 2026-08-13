---
slug: 290
title: '受限環境下檔案複製與遠端傳輸'
# draft: true
author: yexca
date: '2026-08-13T19:01:11+09:00'
categories:
    - 開發實踐
tags:
    - scp
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

自從知道 `scp` 指令後，從本機向伺服器傳輸檔案我已經很少使用 FTP 服務或其他奇奇怪怪的操作了，不過最近由於需要傳輸一個較大的檔案，因為傳輸時間較長，害怕中斷導致損壞於是我開始尋找其他解法，在此過程中管線（pipe）的概念讓我想到了之前折騰 OpenWrt 的時候遇到的操作，遂寫此文

## 遠端傳輸

檔案傳輸可以透過指定 scp 演算法以提高速度，例如使用 AES128-GCM 演算法

```bash
scp -c aes128-gcm@openssh.com /path/to/local/file user@remote:/path/to/dir
```

當然，事實上有改良的同樣基於 SSH 傳輸檔案的 rsync 傳輸效率會更高，但是缺點是有些系統原生不支援 (Windows 也不支援)

```bash
rsync -avzP -e "ssh -c aes128-gcm@openssh.com" /path/to/local/file user@remote:/path/to/dir
```

不過最快的方法是透過管線傳輸，這也是本文的靈感來源

```bash
tar -cf - /path/to/dir | ssh user@remote "tar -xf - -C /path/to/remote/dir"
```

## 受限環境傳輸

之前折騰 OpenWrt 的時候，遇到了當時讓我很震驚的備份檔案指令 `cat /dev/mtdblock0 > /tmp/BL2.bin` ~~彷彿看到了原子彈爆炸，讓我癱坐眩暈了~~

但是實際嘗試複製檔案後，出現前後的 SHA1 值不同的原因就沒有使用過。這次查詢了下原因大概可能是

- Windows 和 Linux 的文字換行符號不同導致的檔案損壞。其中 Linux 為 `\n` 而 Windows 為 `\r\n` 在部分 shell 工具中可能會自動將輸出轉換為文字串流從而引發錯誤
- 編碼問題。由於將資料檔案轉換為文字串流，進行了文字處理操作，自動將編碼改為了例如 UTF-16

不過還是有些方法可以避免這些問題的

### Cat and ssh

```bash
# 從本機傳到遠端
cat local_bin | ssh user@remote "cat > /tmp/remote_bin"

# 從遠端拉到本機
ssh user@remote "cat /tmp/remote_bin" > local_bin
```

### Base64

如果直接傳輸二進位檔案會被截斷，可以使用 base64 演算法將檔案轉換為文字串流然後傳輸

```bash
# 1. 本機轉成純文字
base64 local_bin > bin.txt

# 2. 把 bin.txt 內容複製貼上到受限終端機，寫入 remote.txt

# 3. 遠端解密恢復成二進位
base64 -d remote.txt > /tmp/remote_bin
```

### Hex

如果受限終端機甚至沒有 base64 的話，可以透過十六進位轉換進行傳輸

```bash
# 本機生成 Hex
xxd -p local_bin > bin.hex

# 傳輸

# 遠端還原
xxd -r -p bin.hex > /tmp/remote_bin
```

---

在最極端的傳輸環境下，只能使用 printf 或者 `echo -ne` 列印輸入檔案

```bash
printf '\x7f\x45\x4c\x46\x02\x01...' > /tmp/remote_bin
```

這些轉換後的檔案可能會缺失了執行權限，所以在傳輸完成後需要增加相應的權限

```bash
chmod +x /tmp/remote_bin
```

當然如果雙方架構不匹配的話，這樣傳輸過去的二進位檔案也是無法執行的 (X86 和 ARM)

### 參考文章

<https://openwrt.org/toh/xiaomi/redmi_ax6000>