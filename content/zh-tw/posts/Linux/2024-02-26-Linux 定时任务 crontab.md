---
slug: 159
# layout: post
title: 'Linux 排程任務 crontab'
author: yexca
date: 2024-02-26T21:34:15+08:00
# permalink: /archives/159
categories:
    - 技術學習
tahs:
    - Linux
    - crontab
--- 

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

~~這篇文章還是有點久遠的，書寫習慣和現在不同，甚至看著有點不習慣~~

透過 crontab 指令，我們可以在固定的間隔時間執行指定的系統指令或 shell script 腳本。時間間隔的單位可以是分鐘、小時、日、月、週及以上的任意組合。

## 指令格式

```bash
crontab [-u user] file crontab [-u user] [ -e | -l | -r ]
```

## 指令參數

- -u user：用來設定某個使用者的 crontab 服務。
- file：file 是指令檔案的名稱，表示將 file 作為 crontab 的任務列表檔案並載入 crontab。如果在命令列中沒有指定這個檔案，crontab 指令將接受標準輸入（鍵盤）上鍵入的指令，並將它們載入 crontab。
- -e：編輯某個使用者的 crontab 檔案內容。如果不指定使用者，則表示編輯目前使用者的 crontab 檔案。
- -l：顯示某個使用者的 crontab 檔案內容，如果不指定使用者，則表示顯示目前使用者的 crontab 檔案內容。
- -r：從 /var/spool/cron 目錄中刪除某個使用者的 crontab 檔案，如果不指定使用者，則預設刪除目前使用者的 crontab 檔案。
- -i：在刪除使用者的 crontab 檔案時給予確認提示。

## 檔案格式

執行 `crontab -e` 指令後，會開啟目前使用者的 *crontab* 檔案，在這個檔案中，以 `#` 開頭的語句是註解語句。

在 *crontab* 檔案中，透過 `m h dom mon dow command` 這六個欄位來設定排程任務，每一行對應一個排程任務。這六個欄位的含義說明如下：

- m：對應分鐘 (minute)
  指定要在一小時之中的第幾分鐘執行該任務。取值範圍是 0-59。

- h：對應小時 (hour)
  指定要在一天之中的第幾個小時執行該任務。取值範圍是 0-23。

- dom：對應日期 (day of month)
  指定要在一月之中的第幾天執行該任務。取值範圍是 0-31。

- mon：對應月份 (month)
  指定要在一年之中的第幾月執行該任務。取值範圍是 1-12。
  也可以透過月份英文名稱的前三個字母來指定，不區分大小寫。例如，一月的英文單字是 january，那麼這裡可以用 jan 來指定一月。

- dow：對應星期幾 (day of week)
  指定要在一週之中的星期幾執行該任務。取值範圍是 0-7，0 和 7 都對應星期天。
  也可以透過星期英文名稱的前三個字母來指定，不區分大小寫。例如，星期一的英文單字是 monday，那麼這裡可以用 mon 來指定星期一。

- command：對應具體的操作
  
  提供具體的指令來指定進行什麼操作，可以提供腳本檔案的路徑來執行該腳本檔案。
  
  這六個欄位要求用空格隔開。且每個欄位都必須提供值，不能省略某個欄位的值。從第五個欄位之後的所有內容都屬於第六個欄位，也就是要執行的操作。

***

前五個欄位可以使用下面的特殊字元來指定一些特殊的時間：

- 星號（**\***）：代表**所有**可能的值，例如 month 欄位如果是星號，則表示在滿足其它欄位的制約條件後每月都執行該指令操作。
- 逗號（**,**）：可以用逗號隔開的值指定一個列表**範圍**，例如，"1,2,5,7,8,9"。
- 減號（**-**）：可以用整數之間的減號表示一個**整數範圍**，例如 "2-6" 表示 "2,3,4,5,6"。
- 正斜線（**/**）：可以用正斜線指定時間的**間隔頻率**，例如 "0-23/2" 表示每兩小時執行一次。同時正斜線可以和星號一起使用，例如 */10，如果用在 minute 欄位，表示每十分鐘執行一次。

在 *command* 欄位中，可以使用換行符號、或者 % 字元來分隔指令內容。

在第一個 % 之前的內容會傳遞給 shell 來執行，這個 % 自身會被替換成換行符號，在 % 之後、直到行末的內容都作為標準輸入傳遞。

如果需要提供 % 字元自身，需要用 `\%` 進行跳脫。

## 常用方法

向 cron 程序提交一個 crontab 檔案之前，首先要設定環境變數 EDITOR。cron 程序根據它來確定使用哪個編輯器編輯 crontab 檔案。

由於預設使用 nano 編輯器不是特別好用，可以改為 vi，透過編輯 $HOME 目錄下的 .profile 檔案，在其中加入這樣一行：

```bash
EDITOR=vi; export EDITOR
```

然後儲存並退出。不妨建立一個名為 `<user>cron` 的檔案，其中 `<user>` 是使用者名稱，例如 `yexcacron`。在該檔案中加入要定時執行的內容，例如：

```bash
# (put your own initials here)echo the date to the console every
# 15minutes between 6pm and 6am
0,15,30,45 18-06 * * * /bin/echo 'date' > /dev/console
```

在上面的例子中，系統將每隔 15 分鐘向主控台輸出一次目前時間。如果系統當機或停止回應，從最後所顯示的時間就可以一眼看出系統是什麼時間停止運作的。在有些系統中，用 tty1 來表示主控台，可以根據實際情況對上面的例子進行相應的修改。為了提交你剛剛建立的 crontab 檔案，可以把這個新建立的檔案作為 cron 指令的參數：

```bash
crontab yexcacron
```

現在該檔案已經提交給 cron 程序，它將每隔 15 分鐘執行一次。同時，新建立檔案的一個複本已經被放在 /var/spool/cron 目錄中，檔名就是使用者名稱 (即 yexca)。

## 執行腳本

如果執行腳本需要使用變數：

```bash
30 6 * * * . /etc/profile;/bin/sh /root/zfile/bin/restart.sh
```

以上為每日 6:30 執行 zfile 的 restart.sh。

## 參考文章

[crontab 定時任務 — Linux Tools Quick Tutorial](https://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html)

[Linux技巧：介紹設置定時週期執行任務的方法 - SegmentFault 思否](https://segmentfault.com/a/1190000023186565)

[Linux命令之Crontab——定時任務 - SegmentFault 思否](https://segmentfault.com/a/1190000021815907)

[nano編輯器使用教程 - VPS偵探](https://www.vpser.net/manage/nano.html)

[Linux vi/vim - 菜鳥教程](https://www.runoob.com/linux/linux-vim.html)
