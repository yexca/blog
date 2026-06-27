---
slug: 288
title: 'Excluding Windows Reserved Ports'
# draft: true
author: yexca
date: '2026-06-28T02:00:40+09:00'
categories:
    - Development Practice
tags:
    - Windows
---

{{< notice >}} This article was translated by gemini-3.5-flash {{< /notice >}}

When starting a service, you may occasionally encounter a situation where a port is occupied. However, when you actually query it using `netstat -ano | findstr :[prot]`, you might find that no program is occupying it. This is usually because it has been occupied by Windows as a reserved port.

> If a program is indeed occupying it, you can use the `taskkill` command to terminate the process.

Generally, simply changing to another port will solve the issue. However, when you want to have control over your ports, you need to prevent Windows from using these ports as reserved ports.

## Viewing Reserved Ports

Open CMD or PowerShell as an administrator and use the following command to view them:

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

The command will list all currently reserved ports.

## Random Refresh

Although the ports are randomly refreshed upon every reboot, you can restart the service using the following commands to refresh the ports without rebooting:

```powershell
net stop winnat
net start winnat
```

Then, check again to see if the port you want is still occupied.

## Adding Exclusion Rules

However, to stably use a preferred port, it is more reliable to add an exclusion rule. First, stop the WinNAT service:

```powershell
net stop winnat
```

Then, declare your preferred port range:

```powershell
netsh int ipv4 add excludedportrange protocol=tcp startport=7650 numberofports=10
```

This command excludes 10 ports starting from 7650, which is 7650~7659. Then, simply restart the WinNAT service:

```powershell
net start winnat
```

## Removing Exclusion Rules

When you no longer need them, also stop the service first, and then use the command to delete the exclusion:

```powershell
netsh int ipv4 delete excludedportrange protocol=tcp startport=7650 numberofports=10
```

Finally, restart the service:

## Cause

The root cause of this issue is usually that Windows has Hyper-V or WSL2 enabled. Windows utilizes a service called WinNAT to dynamically allocate a range of ports as dynamic ports for these virtual machines and containers.

Unfortunately, this range is usually very large (for example, potentially anywhere from 1024 to 50000), and it is randomly allocated every time the computer restarts. This leads to a situation where a port that worked fine yesterday might be occupied by the system today and become unusable.