---
slug: 247
title: 'Embracing DevOps: Offloading My Blog Build and Deploy to GitHub'
# draft: true
author: yexca
date: '2025-05-16T18:14:06+09:00'
categories:
    - Development Practice
tags:
    - DevOps
    - GitHub Actions
    - CI/CD
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Introduction

Lately, while thinking about what to do or learn next, the word "DevOps" kept popping up. Initially, I did a quick search and found that I was familiar with most of the listed tech stack. I thought it was just about knowing more tools, similar to "full-stack" (which, in a way, it is). But I wasn't too interested, so I put it aside (honestly, I just lacked development passion).

Until recently, after almost four months of taking it easy, I felt the need to get back into it. That's when "DevOps" came to mind again. After looking into it further, what can I say... it's like extreme consolidation, right? We separated frontend and backend but kept the teams. Now it's like separating dev and ops, but the same person does both.

However, seeing GitHub Actions for automation reminded me of when my Jekyll blog could auto-deploy. But since I migrated from another blog system and kept my subfolder categorization habit, that deployment didn't support subfolders, so I never looked into it deeply. Well, since I'm trying to get things done this time, let's see if my current Hugo blog can be auto-deployed. After all, it's a hassle to download from the container and re-upload every time.

## Workflow

A workflow is defined in a YAML file under the `.github/workflows/` directory in your Git repository's root. The filename can be anything; I'm doing a deploy, so I'll use `deploy.yml`.

The file structure generally consists of a name, a trigger, and jobs.

### Name

This is straightforward, just give it a name.

```yaml
name: Build and Deploy Hugo Blog
```

### Trigger

Action Workflows can be triggered in multiple ways. For me, triggering on every push is enough since I mostly just update articles and then build.

I'll also add a manual trigger, just in case a GitHub configuration error means the Action Workflow won't start until the next push.

```yaml
on:
  push: # Trigger on Git Push
    branches:
      - main  # Listen for updates on the source repository's main branch
  workflow_dispatch: # Manual trigger
```

### Jobs

I only have one job here; you can have multiple jobs that run in parallel.

First, name the job.

```yaml
jobs:
  build-deploy:
```

Then, define the runner; I chose Ubuntu.

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest
```

Next, define the execution steps. The first step is to clone the repository.

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4
```

Then, install Hugo.

```yaml
steps:
  - name: Setup Hugo
    uses: peaceiris/actions-hugo@v2
    with:
      hugo-version: '0.140.1' # This is my local version; higher compatibility
      extended: true # My theme uses SCSS, so the extended version is required
```

Next, the build command.

```yaml
steps:
  - name: Build Hugo Site
    run: hugo --minify
```

Push to my GitHub Pages deployment repository.

```yaml
steps:
  - name: Deploy to BlogWeb repo
    uses: peaceiris/actions-gh-pages@v3
    with:
      external_repository: yexca/Blog-Web-Hugo
      publish_branch: main # Push to the main branch of the target repo yexca/Blog-Web-Hugo
      publish_dir: ./public # The folder to push from the current repo; Hugo defaults to this folder
      personal_token: ${{ secrets.PERSONAL_TOKEN }}
```

So, putting it all together, it looks like this:

```yaml
name: Build and Deploy Hugo Blog

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.140.1'
          extended: true

      - name: Build Hugo site
        run: hugo --minify

      - name: Deploy to blogWeb repo
        uses: peaceiris/actions-gh-pages@v3
        with:
          external_repository: yexca/Blog-Web-Hugo
          publish_branch: main 
          publish_dir: ./public
          personal_token: ${{ secrets.PERSONAL_TOKEN }}

```

## Configuring the Token

Since accessing other repositories requires a Token, you need to generate one.

Go to your `Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens` and generate a Token with read/write permissions for the specified repository.

Then, configure it in your source repository. Mine is `yexca/Blog-Source-Hugo`. Go to the repository's `Settings -> Secrets and variables -> Actions` and add the generated Token under `Repository secrets`. The name should be `PERSONAL_TOKEN`, as configured earlier.

## Handling Domain Issues

If your GitHub Pages uses a custom domain, there's a file named `CNAME` that contains your custom domain. When GitHub Actions Workflow pushes, it effectively deletes all previous content before pushing new content, so the `CNAME` file will also be deleted. You need to add this file before pushing to ensure your custom domain works. There are two methods:

One is to create the file within the workflow:

```yaml
steps:
  - name: Add CNAME
    run: echo 'blog.yexca.net' > public/CNAME
```

Or, simply place a `CNAME` file directly in Hugo's `static` folder, as its contents will be copied directly to the generated content's root directory.

## Theme Module Issues

Because my original theme was added using Git Submodules, pushing it would directly link to the corresponding GitHub repo. However, I've made significant modifications that wouldn't be uploaded to GitHub. Therefore, I need to detach the link.

### Backup Theme Files

Before doing anything, back up your theme by copying it to another folder.

```bash
cp -r themes/Hugo-Theme-Stack tmp/Hugo-Theme-Stack-Backup
```

### Remove Submodule Configuration

First, deinitialize the submodule.

```bash
git submodule deinit -f themes/Hugo-Theme-Stack
```

Remove it from Git.

```bash
git rm -f themes/Hugo-Theme-Stack
```

Remove the files.

```bash
rm -rf .git/modules/themes/Hugo-Theme-Stack
```

Also, delete the `.gitmodules` file in the root directory.

```bash
rm .gitmodules
```

### Restore Theme

Now, move the backed-up files back.

```bash
cp -r tmp/Hugo-Theme-Stack-Backup themes/Hugo-Theme-Stack
```

Delete the backup files (you can test first before deleting).

```bash
rm -rf tmp
```

## Fixing JS Specification Errors

My previous blog's runtime used an older octal number syntax, and since I used the `hugo --minify` command to build and compress, it led to errors.

The fix was quite simple. The original code was:

```javascript
Date.UTC(2021, 10, 06, 14, 15, 19)
```

Changed to:

```javascript
Date.UTC(2021, 10, 6, 14, 15, 19)
```

## Conclusion

Finally, I'm free from local compilation. Ever since I started using Docker, I gradually got used to isolating my development environment from my local system. This way, if I change systems or servers, I just transfer the container. So development has always been isolated from the physical machine, and I've slowly developed an "environment hygiene" habit.

Now it's even better: building and deploying aren't even local anymore. Before, it was isolated to containers; now, it's isolated to the cloud. My environment hygiene habit is completely cured, I guess.

But looking at DevOps again, I feel like it's a product of today's increasingly competitive landscape and ever-convenient technological advancements.  
From early machine adaptation and assembly to the advent of high-level languages, then containerized deployment breaking environmental barriers—each technological iteration brings improved efficiency and lowers the barrier to entry, while subtly raising the "starting line."

While it brings greater convenience to programming life, it also quietly raises the industry's entry bar, making me obsolete faster, I guess.

However, work is work, and life is life. Technology iterates fast, but world systems and industries don't change that quickly. There should still be some breathing room for us.
