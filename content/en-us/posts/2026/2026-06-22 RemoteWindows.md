---
slug: 287
title: 'Remote Control Your Windows PC'
# draft: true
author: yexca
date: '2026-06-22T01:26:59+09:00'
categories:
    - Tinkering Notes
tags:
    - RDP
    - Windows
    - VS Code
---

{{< notice >}} This article was translated by gemini-3.5-flash {{< /notice >}}

Lately, when my local PC is training models, it completely locks me out of doing other work. Using my Mac or Linux devices feels a bit off too, since they already have their own dedicated tasks. So, I figured I'd put the lab computer to use. Once set up, I can run my training there and keep doing my own thing on my main machine.

After doing some digging, I decided to set up three different connection methods to cover my bases: Microsoft's official RDP, VS Code Remote Development, and Chrome Remote Desktop as a backup.

## Tailscale

To use RDP or the VS Code terminal, you need to be on the same local network or have a public IP on the target PC. Setting up reverse tunneling to my own server felt like it might clutter my environment, so I went with a virtual LAN instead.

I used Tailscale to build the virtual LAN. On Windows, just go to the [official site](https://tailscale.com) to download and install it. On Mac, you can install it via Homebrew: `brew install --cask tailscale`.

Once installed, just log into the same account on both machines. Enabling `Run unattended` on the target PC ensures the network stays connected even if the PC reboots and no user is logged into the desktop yet.

## RDP

First off, this feature isn't available on Windows Home. You can enable it under `Settings - System - Remote Desktop`.

Then, install the "Windows App" from the Mac App Store, enter the target PC's IP and username, and you're good to connect.

## VS Code - SSH

For this, you need to enable the OpenSSH feature on the target Windows machine. Go to `Settings - System - Optional features`, search for optional features, and select `OpenSSH Server`.

If you're on Windows Home, it might not show up there. You can install it using PowerShell with Administrator privileges instead:

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

Once installed, check the status:

```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'
```

If the `State` shows `Installed`, the installation succeeded. Next, start the service and set it to run on boot:

```powershell
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

If the `State` is `Staged`, the installation failed. Try rebooting Windows and checking the status again. If it's still stuck on `Staged`, you'll need to reinstall it. Uninstall it first, then run through the installation steps again:

```powershell
Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

When I ran the installation, I ran into this error:

```markdown
Add-WindowsCapability: The Component store has been corrupted.
```

This error means the Windows component store is corrupted. First, verify the system image:

```powershell
DISM /Online /Cleanup-Image /CheckHealth
```

The output showed `Repairable`, so we can fix it automatically:

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
```

Once the repair is done, reboot your PC and try installing OpenSSH again.

---

After successfully starting the SSH service, open VS Code on your control machine and install the `Remote Development` extension pack.

Once installed, press `Ctrl/Cmd + Shift + P`, search for and select `Remote-SSH: Connect to Host...` to configure a new host. Enter the connection command: `ssh username@100.x.x.x` (replace this with your target machine's username and Tailscale IP). Wait for the components to finish installing, and you're in.

## VS Code - Tunnel

If you keep having trouble configuring SSH, you can use VS Code Remote Tunnels to connect without dealing with SSH configuration. If you're on Windows Home, you don't even need to set up Tailscale.

To use it, you'll need to log into the same GitHub account on both ends. First, log into your GitHub account inside VS Code on the target PC. Click your profile icon (or search the command palette) and select `Turn on Remote Tunnel Access`. Choose `Install as a service` and follow the prompts.

After that, you'll find a URL at the end of the logs. Open that link in your browser and log into GitHub to access your environment.

Alternatively, install the `Remote - Tunnels` extension on your control machine. Open the command palette, run `Remote-Tunnels: Connect to Tunnel`, and log into the same GitHub account.

## Chrome

This one is super straightforward. Open <https://remotedesktop.google.com/access> in Chrome, log into your Google account, and set up the remote access service on the target PC. It will automatically guide you through installing the extension and host software.

Once that's done, you can access it from any other computer by logging into the same Google account in Chrome and visiting that URL.