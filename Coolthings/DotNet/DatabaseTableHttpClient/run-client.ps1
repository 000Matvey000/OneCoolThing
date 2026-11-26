param(
  [Parameter(Position = 0)][string]$Config,
  [Parameter(Position = 1)][string]$Flag,
  [Parameter(Position = 2)][string]$Output,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$RemainingArgs
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$forwardArgs = @()

if ($PSBoundParameters.ContainsKey('Config')) {
  if ($PSBoundParameters.ContainsKey('Flag') -and $Flag -eq '--validate-config') {
    $forwardArgs += '--validate-config'
    $forwardArgs += $Config
  }
  else {
    $forwardArgs += $Config
    if ($PSBoundParameters.ContainsKey('Flag')) {
      $forwardArgs += $Flag
    }
    if ($PSBoundParameters.ContainsKey('Output')) {
      $forwardArgs += $Output
    }
  }
}
else {
  $forwardArgs += $RemainingArgs
}

dotnet run -- $forwardArgs
