<#
Runs the fileParser executable and writes combined stdout/stderr to a timestamped log file.

Parameters:
  -ExePath  : Path to the executable. If omitted the script will try to locate `fileParser.exe` under ./bin.
  -Args     : Arguments to pass to the executable (array or single string).
  -LogDir   : Directory where logs will be written. Default: .\logs

Log file naming convention: log_yyyymmdd_hhmmss.txt

Examples:
  # Use default exe discovery and default logs directory
  pwsh .\run-fileParser.ps1

  # Supply explicit exe path and an argument string
  pwsh .\run-fileParser.ps1 -ExePath '.\bin\Release\net9.0\win-x64\fileParser.exe' -Args '/input:myfile.txt' -LogDir '.\\mylogs'

  # Pass multiple args
  pwsh .\run-fileParser.ps1 -Args @('arg1','arg2') -LogDir C:\temp\logs
#>

param(
    [Parameter(Position=0)]
    [string]$ExePath = "",

    [Parameter(Position=1)]
    [string[]]$Args = @(),

    # Named parameters that match Program.cs usage: fileParser <filePath> <fileName> <fileType> <toBeProcessedPath> <archivePath> <errorPath> <processedPath>
    [string]$FilePath = '',
    [string]$FileName = '',
    [string]$FileType = '',
    [string]$ToBeProcessedPath = '',
    [string]$ArchivePath = '',
    [string]$ErrorPath = '',
    [string]$ProcessedPath = '',

    [string]$LogDir = ".\logs"
)


if ([string]::IsNullOrWhiteSpace($ExePath)) {
    Write-Error "Executable path is required. Use -ExePath to provide the path to fileParser.exe."
    exit 2
}

if (-not (Test-Path $ExePath)) {
    Write-Error "Executable not found at path: $ExePath"
    exit 2
}

# Ensure log directory exists
$LogDir = [System.IO.Path]::GetFullPath($LogDir)
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
}

# Timestamp in required format
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = Join-Path $LogDir "log_$ts.txt"

Write-Host "Running executable:`n  $ExePath"

# Collect named parameters in the exact order Program.cs expects and merge with Args[] for backward compatibility
$namedArgs = @($FilePath, $FileName, $FileType, $ToBeProcessedPath, $ArchivePath, $ErrorPath, $ProcessedPath) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
if ($namedArgs.Count -gt 0) {
    # Use the named args in order, then append any additional -Args
    $Args = $namedArgs + $Args
}

if ($Args -and $Args.Count -gt 0) {
    Write-Host "With arguments: $($Args -join ' ')"
} else {
    Write-Host "With no arguments"
}
Write-Host "Logging to: $logFile"

# Run the process, merge stderr into stdout, tee to log file (UTF8) and show on console
try {
    if ($Args -and $Args.Count -gt 0) {
        & $ExePath @Args *>&1 | Tee-Object -FilePath $logFile -Encoding utf8
    } else {
        & $ExePath *>&1 | Tee-Object -FilePath $logFile -Encoding utf8
    }
} catch {
    # Catch invocation errors (file not executable, permission, etc.)
    "ERROR: $($_.Exception.Message)" | Out-File -FilePath $logFile -Encoding utf8 -Append
    Write-Error "Failed to start process: $($_.Exception.Message)"
    exit 3
}

$exitCode = $LASTEXITCODE
Write-Host "Process exited with code $exitCode"
exit $exitCode
