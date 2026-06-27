---
slug: 238
title: 'Software Designer - InfoSec Notes'
# draft: true
author: yexca
date: '2025-03-04T18:38:28+09:00'
categories:
    - Exam Study
tags:
    - Software Designer
    - Operating Systems
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

This article was written around the same time as my [Computer Networks notes](https://blog.yexca.net/en/archives/236/). Both topics are usually covered together for the exam, so I studied them concurrently.

## Firewall Technology

A firewall is a filtering and blocking mechanism deployed at the boundary between internal and external networks. It assumes the internal network is secure and trustworthy, while the external network is not.

Its role is to prevent unwanted, unauthorized access into and out of the protected internal network, thereby strengthening internal network security policies through boundary control.

Firewalls are fundamental and core control measures in network security. They span the main controlled network communication lines, performing security processing (like control, auditing, alarming, and reaction) for any communication behavior passing through these lines. They also handle significant communication loads. Given their critical position in network systems and the constant security threats they face, choosing a secure, stable, and reliable firewall product is paramount.

Firewall technology has evolved through three main stages: packet filtering, application proxy gateways, and stateful inspection.

### Packet Filtering Firewalls

Packet filtering firewalls typically have a packet inspection block (often called a packet filter). Packet filtering controls access between sites, sites and networks, or networks and networks based on information in the packet header. However, it can't control the content of transmitted data, as content is application layer data, and the packet filter operates between the network and data link layers (i.e., TCP and IP layers). The inspection module allows the firewall to intercept and examine all outbound and inbound data. It first opens the packet, extracts the header, determines if the packet conforms to the packet filtering rules based on the header info, and logs it. Packets that don't conform to the rules should trigger an alert and be dropped.

Packet filtering firewalls usually forward packets directly; they are completely transparent to users and operate quickly. Their advantages include: low-level control over every incoming and outgoing packet; examination of each IP packet field (e.g., source address, destination address, protocol, port); ability to identify and drop packets with spoofed source IP addresses; acting as the sole source of access between two networks; and often being integrated into router software, eliminating the need for extra systems. Disadvantages include: inability to defend against hacker attacks, as network admins cannot distinguish reliable from unreliable network boundaries; lack of application layer protocol support because they don't recognize application layer protocols within packets, leading to coarse-grained access control; and inability to handle new security threats.

### Application Proxy Gateway Firewalls

Application proxy gateway firewalls completely sever direct communication between internal and external networks. An internal user's access to the external network becomes the firewall's access to the external network, which is then forwarded by the firewall to the internal user. All communications must be forwarded by application layer proxy software. At no point can a visitor establish a direct TCP connection with the server; the application layer protocol session must comply with the proxy's security policy requirements.

Advantages of application proxy gateways include their ability to inspect protocol features at the application, transport, and network layers, providing strong packet inspection capabilities. Disadvantages are their complexity to configure and very slow processing speeds.

### Stateful Inspection Firewalls

Stateful inspection firewalls combine the security of proxy firewalls with the high speed of packet filtering firewalls. They enhance the performance of proxy firewalls without compromising security.

## Viruses

Characteristics of computer viruses include: transmissibility, stealth, infectivity, latency, triggerability, and destructiveness.

`Worm` refers to worm viruses, `Trojan` to Trojan horses, `Backdoor` to backdoor viruses, and `Macro` to macro viruses.

Macro viruses primarily infect text documents, spreadsheets, etc.

Trojan software: Binghe

Worm viruses: Happy99, Panda Burning Incense, Code Red, ILOVEYOU, Stuxnet.

## Network Attacks

Denial of Service (DoS) Attack: Aims to make a computer or network unable to provide normal services.
DoS attacks are typically executed by continuously sending requests to a target computer.

Replay Attack: An attacker sends a message that the target host has already accepted to achieve an attack goal.
Attackers steal authentication credentials using network sniffing or other methods, then resend them to the authentication server.
Primarily used during the authentication process to undermine its correctness.

Password Attack: Attackers log into the target host using the account and password of a legitimate user, then carry out malicious activities.

Trojan Horse: Disguised as a legitimate program or game. When a user downloads software or an attachment containing the Trojan, the program initiates a connection request to the attacker. Once connected, the attacker carries out malicious activities.

Port Exploitation Attack: Involves using port scanning to find system vulnerabilities and then exploit them.

Network Sniffing: Attackers can intercept all information transmitted over a specific network segment on the same physical channel. Network sniffing allows for easy capture of data, including usernames and passwords.

IP Spoofing Attack: Involves generating IP packets with a forged source IP address to impersonate another system or sender.

SQL Injection Attack: One of the common methods hackers use to attack databases.
It exploits applications that fail to validate the legitimacy of user input, creating security vulnerabilities.
Attackers can submit a piece of database query code. Based on the program's response, they can obtain desired data. By first gaining database privileges, they can acquire user account and password information, and even modify data.

Intrusion Detection Techniques: Expert systems, model-based detection, simple pattern matching.

## Network Security

SSL (Secure Socket Layer) is a transport layer security protocol developed by Netscape in 1994 to enable secure Web communication. The SSL 3.0 protocol draft, released in 1996, became a de facto Web security standard.

TLS (Transport Layer Security) is an IETF-defined protocol. It builds upon the SSL 3.0 protocol specification and is the successor to SSL 3.0.

The protocol for secure connections between client devices and remote sites is SSH. SSH, short for Secure Shell, is an IETF-defined security protocol built upon the application and transport layers. It's specifically designed to provide security for remote login sessions and other network services. By using SSH, information leakage during remote management can be effectively prevented. SSH originated as a program on UNIX and quickly expanded to other operating platforms.

HTTPS (Hypertext Transfer Protocol over Secure Socket Layer) is an HTTP channel designed for security, meaning it's HTTP employing SSL encryption.

MIME (Multipurpose Internet Mail Extensions) is an internet standard that extends the email standard to support: non-ASCII text, non-textual attachments (binary, audio, images, etc.), messages composed of multiple parts, and header information containing non-ASCII characters.

PGP (Pretty Good Privacy) is email encryption software based on the RSA public-key cryptosystem. It can be used to keep emails confidential, preventing unauthorized reading, and to add a digital signature, allowing the recipient to verify the sender of the email.

---

![yexca-238](https://count.getloli.com/@yexca-238)
