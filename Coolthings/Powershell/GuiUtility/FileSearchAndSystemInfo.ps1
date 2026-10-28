Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$script:SearchResults = @()

$form = New-Object System.Windows.Forms.Form
$form.Text = 'PowerShell File Utility'
$form.Size = New-Object System.Drawing.Size(940, 700)
$form.StartPosition = 'CenterScreen'

$sourceLabel = New-Object System.Windows.Forms.Label
$sourceLabel.Text = 'Source folder:'
$sourceLabel.Location = New-Object System.Drawing.Point(10, 15)
$sourceLabel.AutoSize = $true
$form.Controls.Add($sourceLabel)

$sourceTextBox = New-Object System.Windows.Forms.TextBox
$sourceTextBox.Location = New-Object System.Drawing.Point(110, 12)
$sourceTextBox.Size = New-Object System.Drawing.Size(650, 20)
$form.Controls.Add($sourceTextBox)

$browseSourceButton = New-Object System.Windows.Forms.Button
$browseSourceButton.Text = 'Browse'
$browseSourceButton.Location = New-Object System.Drawing.Point(770, 10)
$browseSourceButton.Size = New-Object System.Drawing.Size(120, 25)
$form.Controls.Add($browseSourceButton)

$patternLabel = New-Object System.Windows.Forms.Label
$patternLabel.Text = 'File pattern:'
$patternLabel.Location = New-Object System.Drawing.Point(10, 48)
$patternLabel.AutoSize = $true
$form.Controls.Add($patternLabel)

$patternTextBox = New-Object System.Windows.Forms.TextBox
$patternTextBox.Location = New-Object System.Drawing.Point(110, 45)
$patternTextBox.Size = New-Object System.Drawing.Size(220, 20)
$patternTextBox.Text = '*.*'
$form.Controls.Add($patternTextBox)

$contentLabel = New-Object System.Windows.Forms.Label
$contentLabel.Text = 'Contains text (optional):'
$contentLabel.Location = New-Object System.Drawing.Point(350, 48)
$contentLabel.AutoSize = $true
$form.Controls.Add($contentLabel)

$contentTextBox = New-Object System.Windows.Forms.TextBox
$contentTextBox.Location = New-Object System.Drawing.Point(500, 45)
$contentTextBox.Size = New-Object System.Drawing.Size(260, 20)
$form.Controls.Add($contentTextBox)

$searchButton = New-Object System.Windows.Forms.Button
$searchButton.Text = 'Search Files'
$searchButton.Location = New-Object System.Drawing.Point(770, 43)
$searchButton.Size = New-Object System.Drawing.Size(120, 25)
$form.Controls.Add($searchButton)

$resultsLabel = New-Object System.Windows.Forms.Label
$resultsLabel.Text = 'Results:'
$resultsLabel.Location = New-Object System.Drawing.Point(10, 80)
$resultsLabel.AutoSize = $true
$form.Controls.Add($resultsLabel)

$resultsTextBox = New-Object System.Windows.Forms.TextBox
$resultsTextBox.Location = New-Object System.Drawing.Point(10, 100)
$resultsTextBox.Size = New-Object System.Drawing.Size(900, 260)
$resultsTextBox.Multiline = $true
$resultsTextBox.ScrollBars = 'Vertical'
$resultsTextBox.ReadOnly = $true
$form.Controls.Add($resultsTextBox)

$targetLabel = New-Object System.Windows.Forms.Label
$targetLabel.Text = 'Target folder:'
$targetLabel.Location = New-Object System.Drawing.Point(10, 375)
$targetLabel.AutoSize = $true
$form.Controls.Add($targetLabel)

$targetTextBox = New-Object System.Windows.Forms.TextBox
$targetTextBox.Location = New-Object System.Drawing.Point(110, 372)
$targetTextBox.Size = New-Object System.Drawing.Size(650, 20)
$form.Controls.Add($targetTextBox)

$browseTargetButton = New-Object System.Windows.Forms.Button
$browseTargetButton.Text = 'Browse'
$browseTargetButton.Location = New-Object System.Drawing.Point(770, 370)
$browseTargetButton.Size = New-Object System.Drawing.Size(120, 25)
$form.Controls.Add($browseTargetButton)

$copyButton = New-Object System.Windows.Forms.Button
$copyButton.Text = 'Copy Results'
$copyButton.Location = New-Object System.Drawing.Point(770, 400)
$copyButton.Size = New-Object System.Drawing.Size(120, 25)
$form.Controls.Add($copyButton)

$systemInfoButton = New-Object System.Windows.Forms.Button
$systemInfoButton.Text = 'Get System Info'
$systemInfoButton.Location = New-Object System.Drawing.Point(10, 400)
$systemInfoButton.Size = New-Object System.Drawing.Size(140, 25)
$form.Controls.Add($systemInfoButton)

$systemInfoTextBox = New-Object System.Windows.Forms.TextBox
$systemInfoTextBox.Location = New-Object System.Drawing.Point(10, 435)
$systemInfoTextBox.Size = New-Object System.Drawing.Size(900, 190)
$systemInfoTextBox.Multiline = $true
$systemInfoTextBox.ScrollBars = 'Vertical'
$systemInfoTextBox.ReadOnly = $true
$form.Controls.Add($systemInfoTextBox)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = 'Ready.'
$statusLabel.Location = New-Object System.Drawing.Point(10, 635)
$statusLabel.AutoSize = $true
$form.Controls.Add($statusLabel)

$folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog

$browseSourceButton.Add_Click({
    if ($folderDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $sourceTextBox.Text = $folderDialog.SelectedPath
    }
})

$browseTargetButton.Add_Click({
    if ($folderDialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $targetTextBox.Text = $folderDialog.SelectedPath
    }
})

$searchButton.Add_Click({
    $sourcePath = $sourceTextBox.Text.Trim()
    $pattern = $patternTextBox.Text.Trim()
    $containsText = $contentTextBox.Text

    if ([string]::IsNullOrWhiteSpace($sourcePath) -or -not (Test-Path -LiteralPath $sourcePath -PathType Container)) {
        [System.Windows.Forms.MessageBox]::Show('Select a valid source folder before searching.', 'Invalid source', 'OK', 'Warning') | Out-Null
        return
    }

    if ([string]::IsNullOrWhiteSpace($pattern)) {
        $pattern = '*.*'
    }

    $statusLabel.Text = 'Searching...'
    $form.Refresh()

    try {
        $files = Get-ChildItem -Path $sourcePath -Recurse -File -Filter $pattern -ErrorAction Stop

        if (-not [string]::IsNullOrWhiteSpace($containsText)) {
            $files = $files | Where-Object {
                try {
                    Select-String -Path $_.FullName -Pattern $containsText -SimpleMatch -Quiet -ErrorAction Stop
                }
                catch {
                    $false
                }
            }
        }

        $script:SearchResults = @($files)

        if ($script:SearchResults.Count -eq 0) {
            $resultsTextBox.Text = 'No files matched your search.'
        }
        else {
            $resultsTextBox.Lines = $script:SearchResults.FullName
        }

        $statusLabel.Text = "Search complete. $($script:SearchResults.Count) file(s) found."
    }
    catch {
        [System.Windows.Forms.MessageBox]::Show("Search failed: $($_.Exception.Message)", 'Search error', 'OK', 'Error') | Out-Null
        $statusLabel.Text = 'Search failed.'
    }
})

$copyButton.Add_Click({
    $targetPath = $targetTextBox.Text.Trim()

    if ($script:SearchResults.Count -eq 0) {
        [System.Windows.Forms.MessageBox]::Show('No search results available to copy.', 'Nothing to copy', 'OK', 'Information') | Out-Null
        return
    }

    if ([string]::IsNullOrWhiteSpace($targetPath)) {
        [System.Windows.Forms.MessageBox]::Show('Select a target folder before copying.', 'Missing target', 'OK', 'Warning') | Out-Null
        return
    }

    if (-not (Test-Path -LiteralPath $targetPath -PathType Container)) {
        New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
    }

    $copied = 0
    $skipped = 0

    foreach ($file in $script:SearchResults) {
        $destination = Join-Path -Path $targetPath -ChildPath $file.Name
        if (Test-Path -LiteralPath $destination) {
            $skipped++
            continue
        }

        Copy-Item -LiteralPath $file.FullName -Destination $destination -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $destination) {
            $copied++
        }
    }

    $statusLabel.Text = "Copy complete. Copied: $copied, Skipped existing: $skipped."
    [System.Windows.Forms.MessageBox]::Show($statusLabel.Text, 'Copy results', 'OK', 'Information') | Out-Null
})

$systemInfoButton.Add_Click({
    try {
        $os = Get-CimInstance Win32_OperatingSystem
        $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
        $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType = 3"
        $adapters = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled = True"

        $uptime = (Get-Date) - $os.LastBootUpTime
        $uptimeDisplay = '{0} days {1} hours {2} minutes' -f $uptime.Days, $uptime.Hours, $uptime.Minutes

        $storageLines = $disks | ForEach-Object {
            $freeGB = [math]::Round($_.FreeSpace / 1GB, 2)
            $totalGB = [math]::Round($_.Size / 1GB, 2)
            "{0}  Free: {1} GB / Total: {2} GB" -f $_.DeviceID, $freeGB, $totalGB
        }

        $networkLines = $adapters | ForEach-Object {
            $ips = ($_.IPAddress | Where-Object { $_ -match '^(\d{1,3}\.){3}\d{1,3}$' }) -join ', '
            "{0}: {1}" -f $_.Description, $ips
        }

        $systemInfoTextBox.Text = @(
            "Computer Name: $($env:COMPUTERNAME)",
            "User Name: $($env:USERNAME)",
            "OS: $($os.Caption) ($($os.OSArchitecture))",
            "Version: $($os.Version)",
            "CPU: $($cpu.Name)",
            "Memory: $([math]::Round($os.TotalVisibleMemorySize / 1MB, 2)) GB",
            "Uptime: $uptimeDisplay",
            '',
            'Storage:',
            $storageLines,
            '',
            'Network:',
            $networkLines
        ) -join [Environment]::NewLine

        $statusLabel.Text = 'System info loaded.'
    }
    catch {
        [System.Windows.Forms.MessageBox]::Show("Unable to load system info: $($_.Exception.Message)", 'System info error', 'OK', 'Error') | Out-Null
        $statusLabel.Text = 'System info failed.'
    }
})

[void]$form.ShowDialog()
