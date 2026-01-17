---
slug: 5
title: Setting Up Python in VS Code
date: '2021-11-07T11:28:58+08:00'
author: yexca
# layout: post
# permalink: /archives/5
views:
    - '242'
categories:
    - Tech Learning
tags:
    - Python
    - 'VS Code'
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Let's Get Started

First off, after you've got VS Code and Python installed and environment variables all set:

Fire up VS Code, head over to the Extensions view, search for 'Python', and install it.

When you create a new Python (`.py`) file in the Explorer, VS Code usually whips up a `settings.json` file in your `.vscode` folder. If it doesn't, just create it manually.

Crack open `settings.json` and drop in this config:

```json
{
    "python.linting.flake8Enabled": true,
    "python.linting.flake8Args": ["--max-line-length=248"],
    "python.linting.pylintEnabled": false

}
```

Hop back to your Python file. You'll likely see a warning pop up in the bottom-right of VS Code; hit 'Download'.

Hit `CTRL+SHIFT+P`, then type `Python: Select Interpreter`.

Just pick your installed Python interpreter from the list.

Got a `launch.json` file in your `.vscode` folder? You'll want to add this snippet to its `configurations` array:

```json
{
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal"
        }
```

## Further Reading

[VS Code Python Environment Setup for Beginners](https://blog.csdn.net/Amoduo1/article/details/111246209)

[VS Code Python Configuration Guide](https://blog.csdn.net/Zhangguohao666/article/details/105040139)
