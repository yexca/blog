---
slug: 81
title: 'Linux Learning Chapter 7: Writing Simple Shell Scripts'
date: '2022-12-05T20:47:43+08:00'
author: yexca
# layout: post
# permalink: /archives/81
views:
    - '132'
categories:
    - Tech Learning
tags:
    - Linux
    - Reading Notes
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Chapter 7: Writing Simple Shell Scripts

If you need to perform a task repeatedly that requires many command lines, you can write a shell script to get the job done with a single command.

### 7.1 Understanding Shell Scripts

A shell script is a collection of commands, functions, variables, or other shell features. These items are saved in a plain text file that can be executed as a command.

> Similar to batch files (.bat) in Windows.

#### 7.1.1 Executing and Debugging Shell Scripts

The main advantage of shell scripts is that you can open them in any text editor to view the contents. The biggest drawback is that large or complex scripts usually run slower than compiled programs. There are two basic ways to run a shell script:

1. Pass the script name as an argument to the shell, for example: `bash myscript`

2. Add the interpreter name (`#!/bin/bash`) to the first line, grant execution permissions (`chmod +x myscript`), and run it by specifying the path, for example: (`./myscript.sh`)

Arguments following the script name on the command line are passed as parameters.

> Comments start with `#`
>
> You can add `set -x` at the beginning of the script or use `$ bash -x myscript` to display the commands being executed.

#### 7.1.2 Understanding Shell Variables

Variable names in the shell are case-sensitive. Note that there should be no spaces around the equals sign (`=`) during definition, for example:

`NAME=value`

You can assign constants such as text, numbers, and underscores to variables.

You can also assign the output of a command to a variable, for example: `MYDATE=$(date)` assigns the output of the `date` command to the variable `MYDATE`.

This way, every time `MYDATE` is used, the `date` command result is assigned. You can use single quotes `'` if you want the result of the command at the time of assignment.

---

Special shell characters: dollar sign (`$`), quotes (`'`), asterisk (`*`), exclamation mark (`!`), etc.

If you want to display `$HOME` in the terminal, you need to escape the `$`. Use `echo '$HOME'` or `echo \$HOME`. Specifically:

If you want the shell to interpret a single character literally, use a backslash `\`.

If you want to interpret a group of characters literally, wrap them in single quotes (`'`).

If you want to interpret only part of a group of characters literally, use double quotes (`"`). Inside double quotes, the dollar sign (`$`), quotes (`'`), and exclamation mark (`!`) are still interpreted, but other characters (like the asterisk `*`) are not.

> To assign a value, use the variable name directly. To reference it (get its value), prefix the name with a dollar sign (`$`).
>
> Example: Assigning one variable's value to another: `newVar="$oldVar"`

---

##### Special Shell Positional Parameters

*Positional parameters*, or *command-line arguments*, are named `$0`, `$1`, `$2`...`$n`.

`$0` is the name of the script being called, while the others are assigned the values passed from the command line. For example:

```bash
#!/bin/bash

echo "The first parameter is $1, the second is $2"
echo "The script name is $0"
echo "Total parameters passed: $#"
echo "All parameters are: $@"
```

Executing `./myscript hello bye` results in:

```bash
The first parameter is hello, the second is bye
The script name is /home/yexca/tmp/myscript
Total parameters passed: 2
All parameters are: hello bye
```

Another useful parameter is `$?`, which captures the exit status of the last executed command. Usually, a normal exit returns `0`.

---

##### Reading Parameters

Use the `read` command to get user input.

```bash
#!/bin/bash

read -p "Please enter two nouns: " var1 var2
echo "You entered $var1 and $var2"
```

---

##### Parameter Expansion in Bash

To get a variable's value, use the dollar sign (`$`), e.g., `$var`. This is shorthand for `${var}`.

Bash has rules for expanding parameter values in different ways. Here are common ones using `${var}` as an example:

| Example         | Description                                                                 |
| --------------- | --------------------------------------------------------------------------- |
| ${var:-value}   | If variable is unset or empty, expand to "value"                            |
| ${var#pattern}  | Strip the *shortest* match of pattern from the *front* of var's value       |
| ${var##pattern} | Strip the *longest* match of pattern from the *front* of var's value        |
| ${var%pattern}  | Strip the *shortest* match of pattern from the *end* of var's value         |
| ${var%%pattern} | Strip the *longest* match of pattern from the *end* of var's value          |

These features allow for useful applications:

```bash
myFileName=/home/yexca/myfile.txt
# file becomes myfile.txt
file=${myFileName##*/}
# dir becomes /home/yexca
dir=${myFileName%/*}
# name becomes myfile
name=${file%.*}
# extension becomes txt
extension=${file##*.}
```

#### 7.1.3 Performing Arithmetic in Shell Scripts

Bash uses untyped variables. Unless you use `declare`, variables are treated as strings. They automatically convert to integers during calculations; no need to specify types during assignment.

You can use the built-in `let` command, the external `expr` command, or the `bc` command for integer math.

Examples: `let result=$num/16` or `let num=$RANDOM`.

There are also increment operators: `i++` and `++i`.

> The `let` command requires no spaces between operands and operators.
>
> The `expr` command requires spaces between operands and operators.
>
> The `bc` command has no space requirements and can handle floating-point math.

#### 7.1.4 Using Programming Structures in Shell Scripts

1. "if...then" Statement

```bash
if [ $var -eq 1 ]; then
    echo "The var is 1"
fi
```

For numbers, `-eq` works well. For comparing string values, the equals sign (`=`) is better.

```bash
if [ $str = "hello" ]; then
    echo "hello"
fi
```

There is also the inequality operator `!=`.

Use `elif` for more options and `else` for the default case.

```bash
str="$HOME"
if [ -f "$str" ]; then
    echo "$str is a regular file"
elif [ -d "$str" ]; then
    echo "$str is a directory"
else
    echo "???"
fi
```

Common test conditions:

| Operator  | What it tests                                                                        |
| --------- | ------------------------------------------------------------------------------------ |
| -a file   | Does file exist (same as -e)                                                         |
| -b file   | Is file a block special device                                                       |
| -c file   | Is file a character special device (serial lines, terminals)                         |
| -d file   | Is file a directory                                                                  |
| -e file   | Does file exist (same as -a)                                                         |
| -f file   | Does file exist and is it a regular file (not a directory, socket, pipe, link, etc.) |
| -g file   | Does file have the SGID bit set                                                      |
| -h file   | Is file a symbolic link (same as -L)                                                 |
| -k file   | Does file have the sticky bit set                                                    |
| -L file   | Is file a symbolic link (same as -h)                                                 |
| -n string | Is string length greater than 0                                                      |
| -O file   | Do you own the file                                                                  |
| -p file   | Is file a named pipe                                                                 |
| -r file   | Is file readable                                                                     |
| -s file   | Does file exist and is it larger than 0 bytes                                        |
| -S file   | Does file exist and is it a socket                                                   |
| -t file   | Is file descriptor connected to a terminal                                           |
| -u file   | Does file have the SUID bit set                                                      |
| -w file   | Is file writable                                                                     |
| -x file   | Is file executable                                                                   |
| -z string | Is string length 0                                                                   |

Comparing two variables:

| Operator        | What it tests                                             |
| --------------- | --------------------------------------------------------- |
| expr1 -a expr2  | Are both expressions true                                 |
| expr1 -o expr2  | Is either expression true                                 |
| file1 -nt file2 | Is file1 newer than file2 (modification time)             |
| file1 -ot file2 | Is file1 older than file2 (modification time)             |
| file1 -ef file2 | Are both files linked (hard or symbolic link)             |
| var1 = var2     | Does var1 equal var2                                      |
| var1 -eq var2   | Does var1 equal var2 (integer)                            |
| var1 -ge var2   | Is var1 greater than or equal to var2                     |
| var1 -gt var2   | Is var1 greater than var2                                 |
| var1 -le var2   | Is var1 less than or equal to var2                        |
| var1 -lt var2   | Is var1 less than var2                                    |
| var1 != var2    | Does var1 not equal var2                                  |
| var1 -ne var2   | Does var1 not equal var2 (integer)                        |

You can also combine test operators with `&&` and `||` for logic similar to C's ternary operator.

C: `a>b ? a : b`

Shell: `[ $a -gt $b ] && echo $a || echo $b`

Standalone examples:
`[ $a -eq $b ] && echo $a` returns $a if a equals b.

`[ -d "$dirName" ] || mkdir "$dirName"` creates the directory if it doesn't exist.

---

2. case Command

Similar to `switch` in C, used for selection. General form:

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

3. or...do Loop

Used for iterating over a list.

```bash
for VAR in LIST
do
    body
done

# Or on one line

for VAR in LIST ; do
    body
done 
```

Example:

```bash
for num in 0 1 2 3 4
do
    echo "The number is $num"
done

# Using command output as a list

for file in $(ls /bin) ; do
    echo $file
done
```

4. while...do and until...do Loops

Structures:

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

#### 7.1.5 Useful Text Processing Utilities

Common tools include `grep`, `cut`, `tr`, `awk`, and `sed`. Most are designed to work with standard input/output.

1. General Regular Expression Parser (`grep`)

A tool for finding patterns in files or text. Use it for searching.

Format: `grep [pattern] [input]`

Check `man grep` for more.

2. Removing Sections of Text (`cut`)

`cut` extracts fields from text or files. For example:

`grep /home /etc/passwd | cut -d':' -f6`

First, `grep` gets lines from /etc/passwd containing `/home`, then `cut` splits those lines using `:` as a delimiter and takes the sixth field (`-f6`).

3. Translating or Deleting Characters (`tr`)

`tr` is a character-based translator used to replace or delete characters.

```bash
# Convert uppercase to lowercase
FOO="AbcDEF"
echo $FOO | tr [A-Z] [a-z]

# Replace spaces with underscores in filenames
for file in *; do
    f=$(echo "$file" | tr [:blank:] [_])
    [ "$file" = "$f" ] || mv -i -- "$file" "$f"
done
```

4. Stream Editor (`sed`)

`sed` is a simple script editor for tasks like deleting lines matching a pattern or replacing strings.

It's complex; refer to online documentation for details.

#### 7.1.6 Using a Simple Shell Script

A phone list example:

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
if [ $1 = "new" ]; then
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

### 7.2 Summary

Writing shell scripts allows you to automate common system administration tasks efficiently.
