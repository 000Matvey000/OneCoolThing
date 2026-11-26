param(
  [Parameter(Mandatory = $true)][string]$Config,
  [string]$Flag,
  [string]$Output
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

if ($Flag -eq "--test") {
  dotnet run -- $Config --test $Output
} else {
  dotnet run -- $Config
}
