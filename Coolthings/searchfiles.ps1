# usage .\searchfiles.ps1 -SearchText "YourSearchString" -FromDate "2025-06-01" -ToDate "2025-07-01" -Path "C:\Your\Folder\Path"

param (
    [string]$SearchText,
    [datetime]$FromDate,
    [datetime]$ToDate,
    [string]$Path = "."
)

# Validate parameters
if (-not $SearchText) {
    Write-Error "You must provide a SearchText parameter."
    exit 1
}

if (-not $FromDate) {
    Write-Error "You must provide a FromDate parameter."
    exit 1
}

if (-not $ToDate) {
    Write-Error "You must provide a ToDate parameter."
    exit 1
}

# Search files
Get-ChildItem -Path $Path -Recurse -File |
    Where-Object {
        $_.LastWriteTime -ge $FromDate -and $_.LastWriteTime -le $ToDate
    } |
    ForEach-Object {
        if (Select-String -Path $_.FullName -Pattern $SearchText -Quiet) {
            $_.FullName
			# or do what you want with the file, eg. cp $_.FullName .
        }
    }
