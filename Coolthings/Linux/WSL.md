# Quick Powershell to install WSL

```powershell
﻿# Enable the Windows Subsystem for Linux feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable the Virtual Machine Platform feature
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

#install wsl
wsl --install kali-linux # or other distro in wsl --list --online

# Set WSL 2 as the default version
wsl --set-default-version 2

# uninstall distribution
wsl --unregister Ubuntu # or other distro

# update wsl
wsl --update

# get wsl version 
wsl --version 

# get available distros
wsl --list --online

# get installed distros
wsl --list --verbose

```