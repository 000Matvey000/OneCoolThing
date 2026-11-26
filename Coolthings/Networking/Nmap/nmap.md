# Nmap Notes

**Official site:** https://nmap.org  
**Test host (safe to scan):** `scanme.nmap.org`

---

## Installation

```bash
# Linux (Debian/Ubuntu)
sudo apt install nmap

# macOS
brew install nmap

# Windows
# Download installer from https://nmap.org/download.html
# Npcap is bundled and required for raw packet scans
```

Check version:
```bash
nmap --version   # full version info
nmap -V          # shorthand
# Note: -v means verbose, NOT version
```

---

## Target Specification

```bash
# Single host
nmap 192.168.1.1
nmap scanme.nmap.org

# Multiple hosts (space-separated)
nmap 192.168.1.1 192.168.1.2 192.168.1.3

# Comma list on same subnet
nmap 192.168.1.3,6,9          # scans .3, .6, .9

# Range
nmap 192.168.1.3-9            # scans .3 through .9

# Entire subnet (CIDR)
nmap 192.168.1.0/24           # 256 hosts

# From a file (one host/range per line)
nmap -iL targets.txt

# Exclude specific hosts
nmap 192.168.1.0/24 --exclude 192.168.1.1
nmap 192.168.1.0/24 --excludefile exclude.txt

# Random targets
nmap -iR 10                   # scan 10 random internet hosts
```

---

## Port States

| State | Meaning |
|---|---|
| **open** | Port is actively accepting connections |
| **closed** | Port is reachable but no service is listening |
| **filtered** | Firewall/filter is blocking the probe — nmap cannot determine state |
| **unfiltered** | Port is reachable but nmap cannot determine open/closed (only ACK scan) |
| **open\|filtered** | Cannot tell if open or filtered (UDP, IP, FIN, Null, Xmas scans) |
| **closed\|filtered** | Cannot tell if closed or filtered (IP ID idle scan only) |

---

## Scan Types

### Host Discovery (Ping Scanning)

```bash
nmap -sn 192.168.1.0/24      # ping scan — discover live hosts, no port scan
nmap -Pn 192.168.1.1         # skip host discovery, assume host is up
nmap -PS 192.168.1.1         # TCP SYN ping
nmap -PA 192.168.1.1         # TCP ACK ping
nmap -PU 192.168.1.1         # UDP ping
nmap -PE 192.168.1.1         # ICMP echo ping
```

### TCP Scans

```bash
nmap -sS 192.168.1.1         # SYN scan (stealth/half-open) — DEFAULT with root
                              # Sends SYN, reads SYN-ACK or RST, never completes handshake
                              # Fast and harder to detect in logs

nmap -sT 192.168.1.1         # TCP Connect scan — DEFAULT without root
                              # Full 3-way handshake, visible in target logs

nmap -sA 192.168.1.1         # ACK scan — maps firewall rules, not open/closed
                              # Used to detect stateful vs stateless firewalls

nmap -sW 192.168.1.1         # Window scan — like ACK but checks TCP window size

nmap -sM 192.168.1.1         # Maimon scan — FIN/ACK probe
```

### Covert / Firewall Bypass Scans

```bash
nmap -sN 192.168.1.1         # Null scan — no flags set; open ports drop packet
nmap -sF 192.168.1.1         # FIN scan — only FIN flag set
nmap -sX 192.168.1.1         # Xmas scan — FIN, PSH, URG flags set
# These bypass some stateless firewalls/packet filters
# Do NOT work reliably against Windows (Windows always returns RST)
```

### UDP Scan

```bash
nmap -sU 192.168.1.1         # UDP scan — slower, important for DNS(53), SNMP(161), DHCP(67/68)
nmap -sU -sS 192.168.1.1     # Combine UDP + SYN scan
```

### Other Protocols

```bash
nmap -sO 192.168.1.1         # IP protocol scan — which IP protocols are supported
```

---

## Port Specification

```bash
nmap -p 80 192.168.1.1            # single port
nmap -p 22,80,443 192.168.1.1     # comma list
nmap -p 1-1024 192.168.1.1        # range
nmap -p- 192.168.1.1              # all 65535 ports
nmap -p U:53,T:80 192.168.1.1     # UDP port 53 and TCP port 80
nmap -F 192.168.1.1               # fast scan — top 100 ports only
nmap --top-ports 1000 192.168.1.1 # top N most common ports
nmap -r 192.168.1.1               # scan ports in order (not randomized)
```

---

## Service & Version Detection

```bash
nmap -sV 192.168.1.1              # detect service name and version
nmap -sV --version-intensity 9    # max intensity (0-9, default 7)
nmap -sV --version-light          # intensity 2 — faster, less accurate
nmap -sV --version-all            # intensity 9 shorthand
```

Sample output:
```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.52 ((Ubuntu))
```

---

## OS Detection

```bash
nmap -O 192.168.1.1               # OS detection (requires root/admin)
nmap -O --osscan-guess            # guess OS when not 100% confident
nmap -O --osscan-limit            # only attempt if open+closed TCP port found
```

> OS detection uses TCP/IP stack fingerprinting — it sends a series of probes and compares responses against a database.

---

## Aggressive Scan

```bash
nmap -A 192.168.1.1               # enables -O -sV -sC --traceroute
                                  # comprehensive but noisy
```

---

## Nmap Scripting Engine (NSE)

NSE lets you run scripts for additional enumeration, vulnerability detection, exploitation, and more.

```bash
nmap -sC 192.168.1.1              # run default scripts (safe category)
nmap --script=http-title 192.168.1.1
nmap --script=vuln 192.168.1.1    # run all vuln-category scripts
nmap --script=banner 192.168.1.1  # grab service banners
nmap --script=smb-vuln-ms17-010 192.168.1.1  # check for EternalBlue

# List available scripts
ls /usr/share/nmap/scripts/
nmap --script-help http-title

# Script categories
# auth, broadcast, brute, default, discovery, dos, exploit,
# external, fuzzer, intrusive, malware, safe, version, vuln
```

---

## Output Formats

```bash
nmap -oN output.txt 192.168.1.1   # normal (human-readable)
nmap -oX output.xml 192.168.1.1   # XML (machine-parseable)
nmap -oG output.gnmap 192.168.1.1 # grepable format
nmap -oA output 192.168.1.1       # all three formats at once (output.nmap, output.xml, output.gnmap)
nmap -oS output.txt 192.168.1.1   # "skr1pt k1dd13" format (joke/legacy)

# Append to existing file
nmap --append-output -oN output.txt 192.168.1.1

# Resume an interrupted scan
nmap --resume output.gnmap
```

---

## Verbosity & Debugging

```bash
nmap -v 192.168.1.1               # verbose (shows open ports as found)
nmap -vv 192.168.1.1              # more verbose
nmap -d 192.168.1.1               # debug level 1
nmap -d9 192.168.1.1              # max debug
nmap --reason 192.168.1.1         # show reason for each port state
nmap --open 192.168.1.1           # show only open ports
nmap --packet-trace 192.168.1.1   # show every packet sent/received
```

---

## Timing & Performance

Nmap has 6 timing templates (`-T0` through `-T5`):

| Template | Name | Use Case |
|---|---|---|
| `-T0` | Paranoid | IDS evasion — very slow (5 min between probes) |
| `-T1` | Sneaky | IDS evasion — slow |
| `-T2` | Polite | Less bandwidth, slower |
| `-T3` | Normal | Default |
| `-T4` | Aggressive | Fast networks / CTFs |
| `-T5` | Insane | Fastest — may miss results |

```bash
nmap -T4 192.168.1.0/24           # good default for local networks
nmap -T1 192.168.1.1              # slow, stealthy

# Fine-grained timing
nmap --min-rate 1000 192.168.1.1  # send at least 1000 packets/sec
nmap --max-rate 500 192.168.1.1   # send at most 500 packets/sec
nmap --min-parallelism 10         # at least 10 probes in flight
nmap --max-retries 1 192.168.1.1  # fewer retries = faster
```

---

## Firewall / IDS Evasion

```bash
# Fragment packets (harder for stateless firewalls to reassemble)
nmap -f 192.168.1.1               # 8-byte fragments
nmap -ff 192.168.1.1              # 16-byte fragments
nmap --mtu 24 192.168.1.1         # custom MTU (must be multiple of 8)

# Decoys — make scan appear to come from multiple sources
nmap -D RND:5 192.168.1.1         # 5 random decoy IPs
nmap -D 10.0.0.1,10.0.0.2,ME 192.168.1.1  # specific decoys, ME = real IP position

# Spoof source IP (responses won't reach you — used with idle scan)
nmap -S 10.0.0.5 192.168.1.1

# Source port manipulation (some firewalls allow traffic from port 53/80)
nmap --source-port 53 192.168.1.1
nmap -g 80 192.168.1.1            # same as --source-port

# Idle / Zombie scan — completely blind scan using a zombie host
nmap -sI zombie_host 192.168.1.1

# Append random data to packets
nmap --data-length 25 192.168.1.1

# Randomize target order
nmap --randomize-hosts 192.168.1.0/24

# Slow scan to avoid detection (combine with -T1 or -T2)
nmap -T1 -f --data-length 25 192.168.1.1
```

---

## DNS Options

```bash
nmap -n 192.168.1.1               # never do DNS resolution (faster)
nmap -R 192.168.1.1               # always resolve DNS
nmap --dns-servers 8.8.8.8 target # use specific DNS server
nmap --system-dns target          # use OS resolver
```

---

## Useful Combinations (Cheat Sheet)

```bash
# Quick network sweep — find live hosts
nmap -sn 192.168.1.0/24

# Fast service scan of common ports
nmap -sV -T4 --top-ports 1000 192.168.1.1

# Full port scan with service/OS detection
nmap -sS -sV -O -p- -T4 192.168.1.1

# Comprehensive aggressive scan
nmap -A -T4 192.168.1.1

# Stealth SYN scan with output
nmap -sS -T2 -oA results 192.168.1.0/24

# Scan for common vulnerabilities
nmap -sV --script=vuln 192.168.1.1

# UDP + TCP combined (slow but thorough)
nmap -sS -sU -T4 192.168.1.1

# SMB enumeration
nmap -p 445 --script=smb-enum-shares,smb-enum-users 192.168.1.1

# Web enumeration
nmap -p 80,443,8080,8443 --script=http-title,http-headers 192.168.1.0/24
```

---

## Python Integration

```python
import os
import subprocess

# Simple call
os.system("nmap scanme.nmap.org")

# Capture output
result = subprocess.run(
    ["nmap", "-sV", "-T4", "scanme.nmap.org"],
    capture_output=True,
    text=True
)
print(result.stdout)

# Using python-nmap library (pip install python-nmap)
import nmap
nm = nmap.PortScanner()
nm.scan("scanme.nmap.org", "22-443")
print(nm["scanme.nmap.org"]["tcp"][80])
```

---

## Sample Scan Output

```
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-24 19:23 EDT
Nmap scan report for scanme.nmap.org (45.33.32.156)
Host is up (0.085s latency).
Not shown: 992 closed tcp ports (conn-refused)
PORT      STATE    SERVICE
22/tcp    open     ssh
25/tcp    filtered smtp
80/tcp    open     http
135/tcp   filtered msrpc
139/tcp   filtered netbios-ssn
445/tcp   filtered microsoft-ds
9929/tcp  open     nping-echo
31337/tcp open     Elite

Nmap done: 1 IP address (1 host up) scanned in 2.84 seconds
```

---

## Key Notes

- **Root/Admin required** for SYN (`-sS`), OS detection (`-O`), and raw packet scans.
- Without root, nmap defaults to TCP Connect scan (`-sT`).
- On Windows, install **Npcap** (bundled with the installer) for raw packet support.
- Always have **written authorization** before scanning any network you don't own.
- `scanme.nmap.org` is a legal test target maintained by the nmap project.
