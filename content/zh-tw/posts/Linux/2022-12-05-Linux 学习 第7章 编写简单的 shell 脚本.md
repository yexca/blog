---
slug: 81
title: 'Linux 學習 第七章 撰寫簡單的 Shell 腳本'
date: '2022-12-05T20:47:43+08:00'
author: yexca
# layout: post
# permalink: /archives/81
views:
    - '132'
categories:
    - 技術學習
tags:
    - Linux
    - 讀書筆記
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 第七章 撰寫簡單的 Shell 腳本

如果需要反覆執行某一任務，而該任務又需要輸入大量的命令列，那麼可以透過寫入 Shell 腳本以實現一條指令完成所有任務。

### 7.1 理解 Shell 腳本

Shell 腳本是一組包含指令、函式、變數或其他可以透過 Shell 使用的功能。這些項目被輸入進一個純文字檔案中，而該檔案可以作為一條指令來執行。

> 類似於 Windows 中的批次檔 (.bat)

#### 7.1.1 執行與除錯 Shell 腳本

Shell 腳本的主要優點是可以在任何文字編輯器中打開以查看腳本的內容，最大的缺點是大型或複雜的 Shell 腳本的執行通常比編譯後的程式要慢。可以透過兩種基本的方法執行 Shell 腳本：

1.  將腳本名稱作為 Shell 的一個參數，例如：`bash myscript`

2.  在 Shell 腳本第一行添加解釋器名稱 (`#!/bin/bash`)，給該檔案添加執行權限後 (`chmod +x myscript`)，透過在命令列輸入腳本的路徑運行，例如 (`./myscript.sh`)

在執行時跟在腳本名稱後面的為命令列參數。

> 註釋為 `#`
>
> 可以在腳本開頭添加 `set -x` 以使用 `$ bash -x myscript` 顯示正在執行的指令。

#### 7.1.2 理解 Shell 變數

Shell 變數中的變數名稱是大小寫敏感的，注意定義時等號 (`=`) 左右無空格，例如：

`NAME=value`

可以為變數分配常數，例如文字、數字及下劃線。

也可為變數賦值一個指令，例如：`MYDATE=$(date)` 以將 date 指令的輸出分配給變數 MYDATE。

這樣每次使用變數 MYDATE 將執行一次 date 指令並將結果賦值給 MYDATE。可以將指令放在引號 `'` 中以獲得賦值時指令的執行結果。

---

特殊的 Shell 字元：錢字號 (`$`)、引號 (`'`)、星號 (`*`)、驚嘆號 (`!`) 等。

如果想在命令列輸出顯示 `$HOME` 需要跳脫 `$`，可使用 `echo '$HOME'` 或 `echo \$HOME` ，即：

如果想要 Shell 從字面上解釋單個字元，使用反斜線 `\`。

如果想從字面上解釋一組字元，則使用單引號 (`'`) 包圍這些字元。

如果想從字面上解釋一部分字元，使用雙引號 (`"`) 包圍一組文字，其中錢字號 (`$`)、引號 (`'`) 和驚嘆號 (`!`) 將被解釋，而其他字元 (例如星號 `*`) 則不會被解釋。

> 為變數賦值直接使用變數名，而引用變數，即需要獲取變數值時需要在變數名前加錢字號 (`$`)。
>
> 例如將某變數的值賦值給新變數：`newVar="$oldVar"`

---

1.  ##### 特殊的 Shell 位置參數

*位置參數*，或 *命令列參數*，名為 `$0`、`$1`、`$2`...`$n`。

其中 `$0` 為被呼叫腳本的名稱，而其他的則被賦予從命令列傳遞而來的參數值，例如：

```bash
#!/bin/bash

echo "第一個參數是 $1 ，第二個參數是 $2 "
echo "該腳本名稱為 $0 "
echo "一共傳入了 $# 個參數"
echo "所有的參數為：$@ "
```

執行指令：`./myscript hello bye` ，執行結果如下：

```bash
第一個參數是 hello ，第二個參數是 bye
該腳本名稱為 /home/yexca/tmp/myscript
一共傳入了 2 個參數
所有的參數為：hello bye
```

還有一個有意思的參數 `$?` 接受最後一條被執行的指令的結束狀態，一般正常結束會返回 `0`。

---

2.  ##### 讀取參數

透過使用 `read` 指令讀取使用者輸入。

```bash
#!/bin/bash

read -p "請輸入兩個名詞：" var1 var2
echo "剛剛輸入了 $var1 和 $var2"
```

---

3.  在 Bash 中進行參數展開 (Parameter Expansion)

想獲取一個變數的值，需要在變數名前加錢字號 (`$`) ，例如 `$var` ，這其實是 `${var}` 的簡寫。

Bash 有一些規則可以以不同方式展開參數值，以下為比較常用的，以 `${var}` 為例：

| 範例            | 描述                                                      |
| --------------- | --------------------------------------------------------- |
| ${var:-value}   | 如果變數未設置或為空，則將其展開為 value                  |
| ${var#pattern}  | 從 var 的值的 *前面* 開始刪除與 pattern 最 *短* 的比對項 |
| ${var##pattern} | 從 var 的值的 *前面* 開始刪除與 pattern 最 *長* 的比對項 |
| ${var%pattern}  | 從 var 的值的 *末尾* 開始刪除與 pattern 最 *短* 的比對項 |
| ${var%%pattern} | 從 var 的值的 *末尾* 開始刪除與 pattern 最 *長* 的比對項 |

基於這些特性，可以有一些有用的應用，例如：

```bash
myFileName=/home/yexca/myfile.txt
# file 變為 myfile.txt
file=${myFileName##*/}
# dir 變為 /home/yexca
dir=${myFileName%/*}
# name 變為 myfile
name=${file%.*}
# extension 變為 txt
extension=${file##*.}
```

#### 7.1.3 在 Shell 腳本中執行算術運算

Bash 使用了無類型變數，除非使用 declare 告訴 Bash，否則變數被視為字串。在進行運算時會自動轉為整數，不需要在賦值時指定類型。

可以使用內建 let 指令或外部 expr 指令或 bc 指令完成整數運算。

如：`let result=$num/16` ，或 `let num=$RANDOM`

同時也有遞增運算子，`i++` 和 `++i`

> let 指令要求每個運算元與數學運算子之間不能存在空格。
>
> expr 指令則要求每個運算元和數學運算子之間存在空格。
>
> 而 bc 指令對空格沒有要求，可以完成浮點運算。

#### 7.1.4 在 Shell 腳本中使用程式結構

1.  "if...then" 語句

```bash
if [ $var -eq 1 ]; then
    echo "The var is 1"
fi
```

如果比較數字，`-eq` 比較好，但若比較字串值，等號 (`=`) 不失為一個更好的選擇。

```bash
if [ $str = "hello" ]; then
    echo "hello"
fi
```

此外還有不等號 `!=`

透過使用 `elif` 語句，以提供更多的選擇。使用 `else` 以代表其他情況。

```bash
str="$HOME"
if [ -f "$str" ]; then
    echo "$str 是一個一般檔案"
elif [ -d "$str" ]; then
    echo "$str 是一個目錄"
else
    echo "???"
fi
```

以下是一些可使用的測試條件：

| 運算子    | 測試的內容                                                   |
| --------- | ------------------------------------------------------------ |
| -a file   | 檔案是否存在，與 -e 相同                                     |
| -b file   | 檔案是否為一個區塊裝置 (block device)                        |
| -c file   | 檔案是否為字元裝置 (character device)。用來識別序列埠和終端設備 |
| -d file   | 檔案是否是一個目錄                                           |
| -e file   | 檔案是否存在，與 -a 相同                                     |
| -f file   | 檔案是否存在，是否為一般檔案 (不是目錄、Socket、管線、連結或裝置檔案) |
| -g file   | 檔案是否設置了 SGID 位元                                     |
| -h file   | 檔案是否為一個符號連結，與 -L 相同                           |
| -k file   | 檔案是否設置了黏滯位元 (sticky bit)                          |
| -L file   | 檔案是否為一個符號連結，與 -h 相同                           |
| -n string | 字串的長度是否大於 0 位元組                                  |
| -O file   | 是否擁有該檔案                                               |
| -p file   | 檔案是否為具名管線 (named pipe)                              |
| -r file   | 檔案是否可讀                                                 |
| -s file   | 檔案是否存在，並且大於 0 位元組                              |
| -S file   | 檔案是否存在，並且為 Socket                                  |
| -t file   | 檔案是否為連接到終端的描述符                                 |
| -u file   | 檔案是否設置了 SUID 位元                                     |
| -w file   | 檔案是否可寫                                                 |
| -x file   | 檔案是否可執行                                               |
| -z string | 字串的長度是否為 0 位元組                                    |

以下為兩個變數之間的比較：

| 運算子          | 測試的內容                                        |
| --------------- | ------------------------------------------------- |
| expr1 -a expr2  | 兩個運算式是否都為真 (AND)                        |
| expr1 -o expr2  | 其中一個為真 (OR)                                 |
| file1 -nt file2 | 第一個檔案是否比第二個檔案新 (使用修改時間戳記)   |
| file1 -ot file2 | 第一個檔案是否比第二個檔案舊 (使用修改時間戳記)   |
| file1 -ef file2 | 兩個檔案是否透過一個連結相關聯 (硬連結或符號連結) |
| var1 = var2     | 第一個變數是否等於第二個變數                      |
| var1 -eq var2   | 第一個變數是否等於第二個變數                      |
| var1 -ge var2   | 第一個變數是否大於等於第二個變數                  |
| var1 -gt var2   | 第一個變數是否大於第二個變數                      |
| var1 -le var2   | 第一個變數是否小於等於第二個變數                  |
| var1 -lt var2   | 第一個變數是否小於第二個變數                      |
| var1 != var2    | 第一個變數是否不等於第二個變數                    |
| var1 -ne var2   | 第一個變數是否不等於第二個變數                    |

此外還可以把測試運算子與 `&&` 和 `||` 組合成長得像 C 語言中的三元運算子。

C：`a>b ? a : b`

Shell：`[ $a -gt $b ] && echo $a || echo $b`

也可單獨使用。例如：
`[ $a -eq $b ] && echo $a` 為若 a 等於 b，則輸出 a 的值。

`[ -d "$dirName" ] || mkdir "$dirName"` 為若 `$dirName` 路徑不存在，則執行指令 `mkdir "$dirName"`。

---

2.  case 指令

與 C 語言中的 switch 語句類似，用於選擇。一般形式為：

```bash
case "VAR" in
    Result1)
        body
        ;;
    Result2 | Result3)
        body
        ;;
    *)
        body
        ;;
esac
```

3.  for...do 迴圈

for 迴圈一般用於遍歷一個列表。

```bash
for VAR in LIST
do
    body
done

# 或者這樣

for VAR in LIST ; do
    body
done 
```

例如：

```bash
for num in 0 1 2 3 4
do
    echo "The number is $num"
done

# 或者將指令輸出作為列表

for file in $(ls /bin) ; do
    echo $file
done
```

4.  while...do 和 until...do 迴圈

結構如下：

```bash
# while...do
while condition
do
    body
done

# until...do
until condition
do
    body
done
```

#### 7.1.5 使用一些有用的文字處理程式

最常用的程式包括 grep、cut、tr、awk、sed。大部分程式都設計為使用標準輸入和輸出。

1.  一般正規表示式分析器

也就是 `grep` ，是一種尋找檔案或文字模式的方法。可以當成一個有用的搜尋工具。

格式：`grep 要尋找的內容 輸入`

透過查看 `man grep` 以了解更多。

2.  刪除文字的行段

`cut` 指令可以從文字或檔案中提取欄位。例如：

`grep /home /etc/passwd | cut -d':' -f6 -`

首先 `grep` 指令從 /etc/passwd 檔案獲取包含 `/home` 的行，然後傳入 `cut` 指令，`cut` 指令將這些行以 `:` 分割，然後取第六段 (`-f6`)。

3.  轉換或者刪除字元

`tr` 指令是一個基於字元的轉換器，可用於替換一個或一組字元，或者從文字行中刪除一個字元。

```bash
# 轉換大寫為小寫
FOO="AbcDEF"
echo $FOO | tr [A-Z] [a-z]

# 將該列表中檔名中空格轉換為下劃線
for file in *; do
    f=$(echo "$file" | tr [:blank:] [_])
    [ "$file" = "$f" ] || mv -i -- "$file" "$f"
done
```

4.  串流編輯器 (Stream Editor)

`sed` 指令是一個簡單的腳本編輯器，只能執行一些簡單的編輯，比如刪除文字符合特定模式的行，使用一種模式的字元替換另一種模式的字元等。

過於複雜，請透過線上文件了解。

#### 7.1.6 使用簡單的 Shell 腳本

電話列表的例子：

```bash
#!/bin/bash
# (@)/ph
# A very simple telephone list
# Type "ph new name number" to add to the list, or
# just type "ph name" to get a phone number

PHONELIST=~/.phonelist.txt

# If no command line parameters ($#), there
# is a problem, so ask what they're talking about.
if [ $# -lt 1 ]; then
    echo "Whose phone number did you want? "
    exit 1
fi

# Did you want to add a new phone number?
if [ "$1" = "new" ]; then
    shift
    echo $* >> $PHONELIST
    echo $* added to database
    exit 0
fi

# Nope. But does the file have anything in it yet?
# This might be our first time using it, after all.
if [ ! -s $PHONELIST ]; then
    echo "No names in the phone list yet!"
    exit 1
else
    grep -i -q "$*" $PHONELIST    # Quietly search the file
    if [ $? -ne 0 ]; then    # Did we find anything?
        echo "Sorry, that name was not found in the phone list"
        exit 1
    else
        grep -i "$*" $PHONELIST
    fi
fi
exit 0
```

### 7.2 小結

透過撰寫 Shell 腳本，可以自動完成許多最常見的系統管理任務。
