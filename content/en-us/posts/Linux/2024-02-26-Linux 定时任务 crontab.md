---
slug: 159
# layout: post
title: 'Linux Scheduled Tasks: crontab'
author: yexca
date: 2024-02-26T21:34:15+08:00
# permalink: /archives/159
categories:
    - Tech Learning
tahs:
    - Linux
    - crontab
--- 

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

~~This article is quite old. The writing style is different from my current one, and it feels a bit strange to read.~~

Using the `crontab` command, we can execute specified system commands or shell scripts at fixed intervals. The interval units can be any combination of minutes, hours, days, months, and weeks.

## Command Format

```bash
crontab [-u user] file crontab [-u user] [ -e | -l | -r ]
```

## Command Parameters

- `-u user`: Used to set the crontab service for a specific user.
- `file`: The name of the command file. This loads the file as the crontab task list. If no file is specified, `crontab` accepts input from stdin (keyboard).
- `-e`: Edit the crontab file for a user. Defaults to the current user.
- `-l`: Display the contents of the crontab file. Defaults to the current user.
- `-r`: Remove a user's crontab file from the `/var/spool/cron` directory. Defaults to the current user.
- `-i`: Prompt for confirmation before deleting the crontab file.

## File Format

Executing `crontab -e` opens the current user's *crontab* file. In this file, lines starting with `#` are comments.

Tasks are set using six fields: `m h dom mon dow command`. Each line represents one task. The fields are defined as follows:

- **m**: Minute (0-59)
  Specifies which minute of the hour to run the task.

- **h**: Hour (0-23)
  Specifies which hour of the day to run the task.

- **dom**: Day of Month (1-31)
  Specifies which day of the month to run the task.

- **mon**: Month (1-12)
  Specifies which month of the year to run the task. You can also use the first three letters of the month (case-insensitive), e.g., `jan` for January.

- **dow**: Day of Week (0-7)
  Specifies which day of the week to run the task. Both 0 and 7 represent Sunday. You can also use the first three letters of the day (case-insensitive), e.g., `mon` for Monday.

- **command**: The operation to execute
  The specific command or script path to run.

Fields must be separated by spaces. Every field requires a value. Everything after the fifth field is considered part of the `command` field.

***

The first five fields can use special characters:

- Asterisk (**\***): Represents **all** possible values. For example, a `*` in the month field means the command runs every month.
- Comma (**,**): Specifies a **list** of values, e.g., `1,2,5,7,8,9`.
- Hyphen (**-**): Specifies a **range** of values, e.g., `2-6` means `2,3,4,5,6`.
- Slash (**/**): Specifies **frequency/intervals**. For example, `0-23/2` in the hour field means every two hours. `*/10` in the minute field means every ten minutes.

In the `command` field, you can use newline characters or the `%` character to separate command content.

Content before the first `%` is passed to the shell. The `%` itself is replaced by a newline, and all content after it is passed as standard input.

To use a literal `%` character, escape it with a backslash: `\%`.

## Common Usage

Before submitting a crontab file, set the `EDITOR` environment variable. The `cron` process uses this to determine which editor to open.

The default `nano` editor can be clunky for some. To use `vi`, edit your `.profile` in the `$HOME` directory and add:

```bash
EDITOR=vi; export EDITOR
```

Save and exit. You can create a file named `<user>cron` (e.g., `yexcacron`) and add your tasks:

```bash
# echo the date to the console every 15 minutes between 6pm and 6am
0,15,30,45 18-06 * * * /bin/echo 'date' > /dev/console
```

In this example, the system outputs the current time to the console every 15 minutes. If the system hangs, you can tell when it stopped by looking at the last timestamp. (Note: some systems use `tty1` for the console). To submit this file to `cron`, use it as an argument:

```bash
crontab yexcacron
```

The file is now submitted and will run every 15 minutes. A copy is stored in `/var/spool/cron` named after your username (e.g., `yexca`).

## Executing Scripts

If your script requires environment variables:

```bash
30 6 * * * . /etc/profile;/bin/sh /root/zfile/bin/restart.sh
```

The above runs the `zfile` `restart.sh` script every day at 6:30 AM.

## References

[crontab 定时任务 — Linux Tools Quick Tutorial](https://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html)

[Linux技巧：介绍设置定时周期执行任务的方法 - SegmentFault](https://segmentfault.com/a/1190000023186565)

[Linux命令之Crontab——定时任务 - SegmentFault](https://segmentfault.com/a/1190000021815907)

[nano编辑器使用教程 - VPS侦探](https://www.vpser.net/manage/nano.html)

[Linux vi/vim - 菜鸟教程](https://www.runoob.com/linux/linux-vim.html)
