#!/bin/bash

# neofetch will work also, below is me using screenfetch.
# add this script to your startup applications/scripts (eg. .bashrc) to have it run on login, or run it in a terminal to see the output.

# List of common Linux distros
distros=(
  "Ubuntu"
  "Debian"
  "Fedora"
  "Arch Linux"
  "Kali Linux"
  "CentOS"
  "openSUSE"
  "Linux Mint"
  "Manjaro"
  "Elementary OS"
  "RHEL"
  "Zorin"
)

# Trap Ctrl+C to exit cleanly
trap "echo -e '\nExiting...'; exit" INT

while true; do
  for distro in "${distros[@]}"; do
    clear
    echo "Displaying screenfetch for: $distro"
    screenfetch -D "$distro"
        # Countdown instead of sleep
    for i in {1..5}; do
      echo -ne "Next in $i...\r"
      sleep 1
    done  
  done
done