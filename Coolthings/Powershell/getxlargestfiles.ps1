  Get-PSDrive -PSProvider FileSystem | ForEach-Object {
      $drive = $_.Root
      Get-ChildItem -Path $drive -Recurse -File -ErrorAction SilentlyContinue |
      Sort-Object Length -Descending |
      Select-Object -First 50
  } | Sort-Object Length -Descending | Select-Object -First 10 |
  ForEach-Object {
      [PSCustomObject]@{
          "Size (GB)" = [math]::Round($_.Length / 1GB, 2)
          "Size (MB)" = [math]::Round($_.Length / 1MB, 0)
          Path = $_.FullName
      }
  } | Format-Table -AutoSize
