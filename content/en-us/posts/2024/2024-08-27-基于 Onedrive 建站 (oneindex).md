---
slug: 180
# layout: post
title: 'Building a Website with OneDrive (oneindex)'
author: yexca
date: 2024-08-27T11:00:24+08:00
# permalink: /archives/180
categories:
    - Development Practice
tags:
    - OneDrive
    - Web Development Practice
---  

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

This article was written on May 9, 2022. It hasn't been updated and may be difficult to replicate. I recommend checking out newer projects instead.

You can use OneDrive to build a cloud drive site (e.g., ~~my old VRChat drive~~ which is now gone), host simple web pages, or even set up an image bed.

## Introduction to oneindex

GitHub: <https://github.com/avedu/oneindex>

Onedrive Directory Index. It doesn't consume server space or traffic; it directly lists your OneDrive directory and provides direct download links for files.

## Environment

Requires PHP 5.6+ with curl support enabled. For beginners (~~like myself~~), I recommend using the [BT Panel](https://bt.cn) for quick and easy deployment.

Note: Due to privacy concerns surrounding the BT Panel, some users prefer alternatives like [BT Pure Edition](https://support.hostcli.com/). Use your own judgment when installing.

## Installation

Download the repository from GitHub, upload it to your website's root directory, and unzip it.

Then, visit your website to enter the setup wizard.

### Detection

First, agree to the terms. If clicking "Agree" just reloads the page, remove `&mdui-dialog` from the end of the URL in your browser and hit Enter.

If the environment check passes, click `Next`.

### App Setup

Click `Get App ID and Secret (displayed on two pages, remember to save them)`, then log in with your Microsoft account.

Save the `Application Secret` that appears, then click `Got it, return to quick start`.

**Note**: This secret is only shown once. Keep it safe.

Next, select a language (e.g., `Python`), click `Get a client ID`, and copy the resulting `Client ID`.

Return to the installation interface, enter the `Application Secret` and `Client ID`, and click `Next`.

Click `Bind Account` and select `Accept`.

**If an error occurs:**

Go back to the secret/ID input screen. Open [Azure App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps). You should see two apps there.

Find the app named `oneindex`, copy its `Application (client) ID`, and paste it into the `Client ID` field.

The other app is unnecessary and can be deleted.

## Management

Once installed, you'll see options for the `Admin Panel` and `Visit Website`.

In the admin panel, you can change the site name, theme, and admin password (default password: `oneindex`).

The admin URL is `yourdomain.com/?/admin`.

## URL Rewrite (Pseudo-static)

Set up rewrite rules for Apache or Nginx (the standard WordPress configuration works fine).

The original author mentioned this, but since I use [BT Panel](https://bt.cn), here is how to configure it there:

In the BT Panel, go to your site's `Settings` -> `URL Rewrite`, select the `wordpress` template, and save.

Then, in the oneindex admin panel, check the `Pseudo-static` option and save.

This removes the `?` from your links. You can then access the backend via `yourdomain.com/admin`.

## Special File Features

~~For Markdown syntax, check my notes~~: [Markdown Notes](https://blog.yexca.net/archives/43)

**Add a footer description to a folder:**

> Add a `README.md` file (using Markdown) to the OneDrive folder.

**Add a header description to a folder:**

> Add a `HEAD.md` file (using Markdown) to the OneDrive folder.

**Encrypt a folder:**

> Add a `.password` file to the OneDrive folder and enter your password. The password cannot be empty.

**Directly render a webpage:**

> Add an `index.html` file to the OneDrive folder. The program will render the page directly instead of listing the directory.
> This works best when combined with "File Display Settings - Direct Output".

Since it can output HTML directly, you can use it to host a full website.

## 404 Errors when Accessing Images

This happens because the server software (Nginx/Apache) tries to handle the image requests instead of the PHP script. You need to remove or comment out the relevant configuration.

If using BT Panel:

Go to `Website` -> `Config` and comment out the following block:

```nginx
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
{
  expires      30d;
  access_log on; 
}
```

Change it to:

```nginx
#location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
#{
#  expires      30d;
#  access_log on; 
#}
```

Credit for this fix goes to [VirCloud's Blog](https://vircloud.net/media/oneindex.html#selection-997.0-997.84).

## Command Line Features

These only run in PHP CLI mode.

**Clear Cache:**

```bash
php one.php cache:clear
```

**Refresh Cache:**

```bash
php one.php cache:refresh
```

**Refresh Token:**

```bash
php one.php token:refresh
```

**Upload File:**

```bash
php one.php upload:file local_file [OneDrive_path]
```

**Upload Folder:**

```bash
php one.php upload:folder local_folder [OneDrive_folder]
```

Examples:

```bash
// Upload demo.zip to OneDrive root
php one.php upload:file demo.zip  

// Upload demo.zip to OneDrive /test/ directory
php one.php upload:file demo.zip /test/  

// Upload demo.zip to OneDrive /test/ and rename it to d.zip
php one.php upload:file demo.zip /test/d.zip  

// Upload local folder up/ to OneDrive /test/ 
php one.php upload:file up/ /test/
```

## Scheduled Tasks (Cron Jobs)

[Optional] **Recommended configuration**. Not strictly required, but refreshing the cache in the background speeds up front-end access.

```bash
# Refresh token every hour
0 * * * * /path/to/php /path/to/one.php token:refresh

# Refresh cache every ten minutes
*/10 * * * * /path/to/php /path/to/one.php cache:refresh
```

## Docker Installation

Please refer to [TimeBye/oneindex](https://github.com/TimeBye/oneindex).
