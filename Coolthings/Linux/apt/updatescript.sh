
#!/bin/bash
# full-upgrade is used to upgrade the system and install/remove packages that are needed to upgrade the system
# -y is used to automatically answer yes to all prompts
# autoremove is used to remove packages that are no longer needed
# autoclean is used to remove packages that are no longer available for download
# update is used to update the package list
# tee is used to display the output on the terminal and write it to a file at the same time

# formatted in yyyyMMddHHmmss

# read -p is used to prompt the user for input, -p is used to specify the prompt message
# answer is used to store the user's input

current_date=$(date +"%Y%m%d%H%M%S")

logts_date=$(date +"[%Y-%m-%d-%H-%M-%S]")

log_file="./update$current_date.log"

read -p "Do you want to proceed with the script? (yes/no): " answer

if [ "$answer" = "yes" ]; then

echo "System update, upgrade, clean, and remove started! at: $logts_date" | tee -a $log_file
sudo apt update -y | tee -a $log_file
sudo apt full-upgrade -y | tee -a $log_file
sudo apt autoremove -y | tee -a $log_file
sudo apt autoclean -y | tee -a $log_file
echo "System update, upgrade, clean, and remove completed! at: $logts_date" | tee -a $log_file


else
    logts_date=$(date +"[%Y-%m-%d-%H-%M-%S]")
    echo "System update, upgrade, clean, and remove cancelled :( ! at: $logts_date"
fi