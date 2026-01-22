---
slug: 69
title: 'Linux Learning Chapter 3: Using the Shell'
date: '2022-09-12T15:04:10+08:00'
author: yexca
# layout: post
# permalink: /archives/69
views:
    - '305'
categories:
    - Tech Learning
tags:
    - Linux
    - Reading Notes
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Chapter 3: Using the Shell

This chapter introduces the Linux shell known as the Bash shell, short for Bourne Again shell. There are other shells, such as the C shell (csh) popular among BSD UNIX users, the Korn shell (ksh) popular in UNIX System V, Dash (Ubuntu's default shell, faster than Bash), Tcsh (an improved C shell), and Ash (very similar to the Bourne shell).

### 3.1 Shell and Terminal Windows

1. Using Terminal Windows

Through the GUI, you can open a terminal emulator (sometimes called a Terminal window) to start a shell.

Most systems open it via the *Ctrl+Shift+T* shortcut. In Fedora, look for it in the applications or press *Alt+F2* and type *gnome-terminal*.

2. Using Virtual Consoles

Most Linux systems with a GUI run multiple virtual consoles at startup. Besides the one running the GUI, you can open multiple shell sessions.

Switch virtual consoles using *Ctrl+Shift+F1~F6*. In Fedora, tty1 is gdm (login screen), tty2 is the first desktop, tty3 is the second (plain text), and so on.

* Command Prompt

For regular users, the default prompt is a simple dollar sign:

`$`

For the root user, the default prompt is a pound sign (also known as a number sign or hash tag):

`#`

~~A vivid illustration of the US root being in the UK.~~

### 3.2 Choosing a Shell

Use the `who` command to display the current logged-in username, the virtual console, and the login time.

Use `grep username /etc/passwd`. The end of the output shows the default shell being used.

You can switch shells by typing the command for it, such as `ksh`, `tcsh`, `csh`, `sh`, `dash`, or others (assuming they are installed).

> Learning Bash is important not just because it's the default in most installs, but because it's the standard for most Linux certification exams.

### 3.3 Running Commands

While many commands run just by typing their name, it's common to follow them with options and arguments to change their behavior.

#### 3.3.1 Understanding Command Syntax

* Most commands have one or more options to modify behavior.

Options are usually a single letter preceded by a hyphen `-`. You can combine multiple single-letter options or use a hyphen for each.

Some options are full words, usually preceded by a double hyphen `--`. For example, to use the `help` option, you type `--help`. Typing `-help` would be interpreted as four options: `-h`, `-e`, `-l`, and `-p`. While some commands don't follow the double-hyphen rule, most do for word-based options.

* Most commands also accept arguments after options or at the end of the line.

An argument is a block of extra info, like a filename, directory, username, or device. You can usually use any number of arguments as long as you don't exceed the total character limit of the command line.

Sometimes an argument is associated with an option and must follow it immediately. For single-letter options, the argument is usually after a space. For full-word options, the argument follows an equals sign `=`.

Example:

```bash
tar -cvf backup.tar /home/yexca
```

The options mean create (c) a file (f) named backup.tar containing all files in /home/yexca, and show verbose details (v) once finished. Since backup.tar is an argument for the `f` option, it must follow it.

```bash
ls --hide=Desktop
```

The `--hide` option tells `ls` not to show the file or directory named Desktop. Note there is no space between the option and the argument.

* Other commands to try:

The `uname` command shows the system type. Add the `-a` option to see the hostname and kernel version.

When logged in, Linux assigns you an identity including a username, group name, user ID (UID), and group ID (GID). It also tracks the session time and location. Use the `id` command to see identity info.

> Distros with SELinux (Security Enhanced Linux) enabled show extra info at the end of `id` output, like:
>
> context=unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023
>
> SELinux provides a way to strictly lock down Linux system security.

Use `who -uH` to add idle time and process ID info (u) and print headers (H).

IDLE shows how long the shell has been open without input. PID is the Process ID of the login shell. COMMENT shows the remote computer name (if logging in over a network) or the local X Display name (if using a Terminal window), such as *:0.0*.

#### 3.3.2 Finding Commands

To find the command you typed, the shell searches through a "path". For commands not in the path, you must provide the full path to the executable.

Use `echo $PATH` to see the shell's PATH environment variable.

Reference: [Linux bin Directory - yexca’Blog](https://blog.yexca.net/en/archives/60)

Unlike some other OSs, Linux does not check the current directory for executables by default before searching the path. It only runs an executable in the current directory if it's in the PATH or if you provide an absolute or relative path.

****

Not all commands are in the PATH directories. Some are built into the shell. You can also override commands using aliases. Here is the order the shell uses to check input:

1. Aliases: Names set by the `alias` command. Type `alias` to see current ones.

2. Shell Reserved Words: Words reserved by the shell for special purposes.

3. Functions: Groups of commands that run together in the current shell.

4. Built-in Commands: Commands built into the shell with no external file, like `cd`, `echo`, `exit`, `pwd`, `history`, `fg` (bring background command to foreground), `set` (set shell options), and `type` (show command location).

5. File System Commands: Commands stored in the computer's file system (represented by the PATH variable).

To find where a command comes from, use `type` or `which`. Use `type -a` to show all known locations of a command.

****

If a command isn't in the PATH, use `locate` to find it. `locate` can access any reachable part of the system.

`locate` searches the entire file system, not just command directories. If it can't find a recently added file, run `updatedb` as root to update the database.

### 3.4 Using Command History

Repeating long, complex, or error-prone commands saves a lot of trouble.

#### 3.4.1 Command Line Editing

By default, Bash uses Emacs-based command line editing. If you prefer vi, add `set -o vi` to your `.bashrc` file.

* Navigation Keys:

| Key | Name | Meaning |
| ------ | ------------ | -------------------------------- |
| Ctrl+F | Forward one char | Move forward one character |
| Ctrl+B | Backward one char| Move backward one character |
| Alt+F  | Forward one word | Move forward one word |
| Alt+B  | Backward one word| Move backward one word |
| Ctrl+A | Start of line | Go to the beginning of the line |
| Ctrl+E | End of line | Go to the end of the line |
| Ctrl+L | Clear screen | Clear screen, leave cursor at top |

* Editing Keys:

| Key | Name | Meaning |
| --------- | -------------- | -------------------------------------- |
| Ctrl+D    | Delete current | Delete character at cursor |
| Backspace | Delete previous| Delete character before cursor |
| Ctrl+T    | Swap characters| Swap current and previous characters |
| Alt+T     | Swap words | Swap current and previous words |
| Alt+U     | Uppercase word | Change current word to uppercase |
| Alt+L     | Lowercase word | Change current word to lowercase |
| Alt+C     | Capitalize | Capitalize the first letter of the word |
| Ctrl+V    | Insert special | Add a special character (e.g., a Tab) |

* Cut and Paste Keys:

| Key | Name | Meaning |
| ------ | -------------- | ------------------------------ |
| Ctrl+K | Cut to end | Cut all characters after the cursor |
| Ctrl+U | Cut to start | Cut all characters before the cursor |
| Ctrl+W | Cut prev word | Cut the word before the cursor |
| Alt+D  | Cut next word | Cut the word after the cursor |
| Ctrl+Y | Paste current | Paste the most recently cut text |
| Alt+Y  | Paste earlier | Cycle back to earlier cut text and paste |
| Ctrl+C | Delete line | Delete the entire command line |

#### 3.4.2 Command Line Completion

To reduce typing, Bash provides tab completion. Type a few characters and hit *Tab*. Bash can complete:

* Commands, aliases, or functions.
* Variables: If the text starts with `$`.
* Usernames: If the text starts with `~`. `~username` represents that user's home directory.
* Hostnames: If the text starts with `@`, using entries from `/etc/hosts`.

> To add hostnames from other files, set the `HOSTFILE` variable to that filename (using the same format as `/etc/hosts`).

If there are multiple matches, double-tap *Tab* to list them all.

#### 3.4.3 Repeating History Commands

Every line you type is saved to the shell's history list.

Use `history` to see the list, or add a number to see the most recent entries.

Use the exclamation mark `!` to rerun commands. These execute immediately without confirmation.

* !n --- Run command by number. e.g., `!255`.
* !! --- Run the previous command.
* !?string? --- Run the command containing the string.

---

Besides running history directly, you can find and edit specific commands:

| Key | Function | Description |
| ----------------------------- | ------------ | ------------------------------------------------------------ |
| Arrow keys or<br/>Ctrl+P & Ctrl+N | Step | Traverse history list line by line |
| Ctrl+R | Reverse search | Incremental search backward. Matches appear as you type |
| Ctrl+S | Forward search | Incremental search forward (doesn't work in all terminals) |
| Alt+P | Reverse search | Search backward for a string. Hit Enter to see the match |
| Alt+N | Forward search | Search forward for a string |

---

You can also use the `fc` command. Typing `fc` followed by a number or range (e.g., `fc 233 255`) opens those commands in a text editor (default is vi). When you close the editor, the commands run sequentially.

When the shell closes, history is saved to `.bash_history` in your home directory (default limit is 1000 lines).

> To exit without saving history, use `kill -9 PID` on the shell process.
>
> Setting `HISTFILE` to `/dev/null` or clearing `HISTSIZE` won't stop the save if the shell exits normally.

### 3.5 Connecting and Expanding Commands

The real power of the shell lies in redirecting input/output between commands or files.

Shells use *metacharacters* to link or expand requests. These include `|`, `&`, `;`, `)`, `(`, `<`, and `>`.

#### 3.5.1 Pipes Between Commands

The pipe `|` connects the output of one command to the input of another. Example:

```bash
cat /etc/passwd | sort | less
```

This lists the contents of /etc/passwd, sorts them, and sends the result to `less` for viewing.

#### 3.5.2 Sequential Commands

Use a semicolon `;` to separate multiple commands on one line. Example:

```bash
date ; troff -me VertLargeDocument | lpr ; date
```

This formats a large document and shows the time before and after.

#### 3.5.3 Background Commands

For long-running tasks, use the ampersand `&` to run them in the background. Example:

```bash
troff -me VertLargeDocument | lpr &
```

Don't close the shell or kill the process before it finishes, or the task will terminate.

#### 3.5.4 Command Expansion

Command substitution lets you use the output of one command as an argument for another.

The two forms are `$(command)` and ````command```` (backticks).

Example:

```bash
vi $(find /home | grep xyzzy)
```

The shell runs the substitution first: `find` looks in /home, `grep` filters for "xyzzy", and `vi` opens the resulting files one by one.

Note: Don't run this from the root directory or you might try to edit thousands of files.

#### 3.5.5 Arithmetic Expansion

To pass arithmetic results to a command, use `$[expression]` or `$((expression))`. Example:

```bash
echo "I am $[2022-1957] years old"
```

Output: I am 65 years old.

```bash
echo "There are $((ls | wc -w)) files in this directory"
```

This counts the files (ls | wc -w) and outputs the number.

#### 3.5.6 Variable Expansion

Use the dollar sign `$` to expand variables. It prints the value of the variable, not the name. Example:

```bash
ls -l $BASH
```

Prints the long listing for the bash command: `-rwxr-xr-x. 1 root root 1390064 Jan 20 2022 /usr/bin/bash`.

### 3.6 Using Shell Variables

The shell uses variables to store session info. Use `set` to see all variables.

A subset of these are environment variables, which are passed to new shells opened from the current one. Use `env` to see these.

System files also set variables for mail, paths, and config locations. Prefix the name with `$` to reference the value.

Many variables are preset at startup. Here are some common ones:

| Variable | Description |
| -------------- | ------------------------------------------------------------ |
| BASH | Full path to the Bash command. Usually /bin/bash |
| BASH_VERSION | The version number of Bash |
| EUID | Effective User ID. Assigned from /etc/passwd at startup |
| FCEDIT | Editor used by the `fc` command. Default is vi |
| HISTFILE | Location of the history file, usually $HOME/.bash_history |
| HISTFILESIZE | Max history entries. Older ones are dropped when limit is reached |
| HISTCMD | Returns the current command number in the history list |
| HOME | Home directory |
| HOSTTYPE | System architecture (e.g., i386, x86_64) |
| MAIL | Mailbox location, usually /var/spool/mail/$USER |
| OLDPWD | The previous working directory |
| OSTYPE | OS identification (e.g., Linux or Linux-gnu) |
| PATH | Colon-separated list of directories searched for commands |
| PPID | Process ID of the parent process |
| PROMPT_COMMAND | A command to run before displaying the prompt |
| PS1 | Main shell prompt. PS2, PS3, etc., are for extra prompts |
| PWD | Current working directory |
| RANDOM | Generates a random number from 0-32767 |
| SECONDS | Seconds since the shell started |
| SHLVL | Shell nesting level. Increments when you start a sub-shell |
| TMOUT | Auto-logout time in seconds if the shell is idle |

#### 3.6.1 Creating and Using Aliases

Use `alias` to list or create aliases.

```bash
alias p='pwd ; ls -CF'
```

Running `p` now runs `pwd` then `ls -CF`. Use `unalias` to remove it.

#### 3.6.2 Exiting the Shell

Type `exit` or press *Ctrl+D*.

### 3.7 Customizing Your Shell Environment

#### 3.7.1 Shell Configuration

Multiple config files determine shell behavior:

| File | Description |
| --------------- | ------------------------------------------------------------ |
| /etc/profile | System-wide environment info for all users at login. Collects settings from /etc/profile.d |
| /etc/bashrc | Runs for every Bash shell. Sets default prompt and aliases |
| ~/.bash_profile | User-specific login settings. Usually sets environment variables and runs .bashrc |
| ~/.bashrc | Specific to Bash. Read at login and every new shell. Best place for aliases |
| ~/.bash_logout | Runs at logout. Usually clears the screen |

To change `/etc/profile` or `/etc/bashrc`, you need root access. It's better to create `/etc/profile.d/custom.sh` for system-wide changes instead of editing the main files.

* nano Editor

A simple text editor. `Ctrl+O` to save, `Ctrl+X` to exit.

#### 3.7.2 Setting the Prompt

The prompt is set by the `PS1` variable. Special characters include:

| Character | Description |
| -------- | ------------------------------------------------------------ |
| \\!      | Current command history number |
| \\#      | Command number in the current session |
| \\$      | `$` for users, `#` for root |
| \\W      | Basename of current directory |
| \\[      | Start of non-printing characters (for colors/bolding) |
| \\]      | End of non-printing characters |
| \\\\     | Backslash |
| \\d      | Date (Day Month Date) |
| \\h      | Hostname |
| \\n      | Newline |
| \\nnn    | Character represented by octal number nnn |
| \\s      | Shell name |
| \\t      | Current time (HH:MM:SS) |
| \\u      | Username |
| \\w      | Full path of current directory |

Temporary change: `export PS1="[\t\w]\$"`

Permanent change: Add the PS1 value to `~/.bashrc`.

Read more: [Bash Prompt HOWTO](https://www.tldp.org/HOWTO/Bash-Prompt-HOWTO)

#### 3.7.3 Adding Environment Variables

You might want to add variables to `.bashrc`:

* TMOUT --- Seconds before auto-logout.
* PATH --- Search directories. To add `/home/yexca/bin`:
  `PATH=$PATH:/home/yexca/bin ; export PATH`
  This reads the current PATH, appends the new one, and exports it.

> Never add `.` (current directory) to your PATH for security reasons.

* Custom Variables: Create shortcuts for your workflow.
  `MYWORKDIR=/home/yexca/work ; export MYWORKDIR`
  Then just use `cd $MYWORKDIR`.

### 3.8 Getting Info on Commands

Some commands are built into the shell. Use `help | less` or `help command` for info.

Most commands support the `--help` or `-h` option.

Use `info` and `man command` for in-depth documentation.

---

Manual (man) pages are the standard for Linux documentation. They are divided into 8 sections:

| Section | Name | Description |
| ---- | ---------------------- | ---------------------------------------- |
| 1    | User Commands | Commands run by normal users |
| 2    | System Calls | Kernel programming functions |
| 3    | C Library Functions | Interface functions for programming libraries |
| 4    | Devices and Special Files | Files representing hardware/software devices |
| 5    | File Formats | File types and config file formats |
| 6    | Games | Games on the system |
| 7    | Miscellaneous | Overviews of protocols, file systems, etc. |
| 8    | Admin Tools | Commands requiring root/admin privileges |

Use `man -k` to search the database. If there are no results, run `mandb` as root to initialize it.

Use `man 5 passwd` to view section 5 specifically.

Navigate using Page Up/Down or Enter/Arrow keys. Search using `/` followed by the string. `n` for next match, `N` for previous. Press `q` to exit.
