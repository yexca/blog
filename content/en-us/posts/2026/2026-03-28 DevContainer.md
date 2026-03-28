---
slug: 274
title: 'Embracing Dev Containers: Say Goodbye to Environment Dependencies'
# draft: true
author: yexca
date: '2026-03-28T16:12:02+09:00'
categories:
    - Development Practices
tags:
    - Dev Container
    - Docker
    - Git
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

Environment configuration is critical, especially in frontend development. Every `npm install` feels like a gamble because dependency resolution fails so often. It's also a massive headache to manually match the original development environment just to reproduce a project.

While exploring the frontend landscape, I came across newer Islands Architectures like Astro and Qwik. Since I wasn't entirely satisfied with my Hugo Book-based site, I decided to migrate.

To ensure reproducibility—and because I recently switched to a new computer—I started using Dev Container technology to containerize my blog development environment.

## Configuration

Setting it up is quite convenient. Create a `.devcontainer` folder in the project root, write a `Dockerfile` to build the image, and then configure the settings in `devcontainer.json`.

The `Dockerfile` uses standard syntax to pull the required image and install dependencies.

For a full list of `json` configuration options, refer to: <https://containers.dev/implementors/json_reference/>. My blog setup is quite simple; you can use it as a reference:

```json
{
    "name": "yexca-blog",
    "build": {
        "dockerfile": "Dockerfile",
        "args": {
            "HUGO_VERSION": "0.140.1"
        }
    },
    "customizations": {
        "vscode": {
            "extensions": [
                "budparr.language-hugo-vscode", // Hugo syntax highlighting
                "ritwickdey.LiveServer"         // Live preview helper
            ]
        }
    },

    "remoteUser": "vscode"
}
```

## Setting the Timezone

Initially, I pushed my changes and immediately noticed something strange: the commit times on GitHub didn't match my local time. After some troubleshooting, I realized the container defaults to UTC. It's best to set the timezone manually after the build.

Since different Linux distributions might handle this differently, I prefer using commands to define the timezone.

The standard way to set the time is:

```bash
sudo timedatectl set-timezone Asia/Tokyo
```

However, the lightweight Linux versions used in containers often lack this command. You can use this instead:

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
```

Verify the setting:

```bash
date -R
```

## Git

Since the container effectively acts as a new machine, there are some hurdles when pushing with Git. While VS Code claims to share credentials with the local repository, it didn't automatically recognize my 1Password SSH agent.

There are two ways to solve this. The first is very simple: copy your `~/.ssh` directly into the container. It's a bit risky, but fine if you're the only one using it. The second method is to build the Dev Container locally, push it to GitHub, and then choose "Clone Repository in Container Volume" in VS Code. Once you log into your GitHub account, you can pull, build, and push seamlessly.

## Experience

I was already using Dev Containers before this, so I knew they were convenient. However, building a custom image from scratch this time felt incredibly smooth. It perfectly solves the cross-device environment issue. When switching devices, I don't need to install anything—just clone and start developing. Once you try it, you'll see how great it is. It also achieves full environment parity between development and deployment (since everything runs in containers).

## References

<https://vscode.js.cn/docs/devcontainers/containers#_working-with-git>
