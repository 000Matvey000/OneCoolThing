# PowerShell GUI Utility

This utility provides a simple Windows PowerShell GUI for:

1. Searching for files in a selected folder (with pattern + optional text filter)
2. Reviewing results in a text box
3. Optionally copying found files to a target folder (non-destructive: existing target files are skipped)
4. Viewing basic machine information (network, storage, uptime, plus core system details)

## Files

- `FileSearchAndSystemInfo.ps1` – GUI script

## Requirements

- Windows PowerShell 5.1+ or PowerShell 7+
- Windows with .NET support for `System.Windows.Forms`

## Run

From this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\FileSearchAndSystemInfo.ps1
```

or:

```powershell
pwsh -ExecutionPolicy Bypass -File .\FileSearchAndSystemInfo.ps1
```

## Notes

- Copy behavior is intentionally safe: files with the same name already in the target folder are not overwritten.
- The script uses recursive search under the selected source folder.
- System info output is rendered as plain text lines for storage/network sections, including clear fallback messages when data is unavailable.
