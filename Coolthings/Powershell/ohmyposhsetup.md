# Oh My Posh Setup Guide

## Prerequisites

- Windows Terminal installed
- PowerShell 7+ (`pwsh`) installed

---

## 1. Install Oh My Posh

Run in PowerShell (no admin required):

```powershell
winget install JanDeDobbeleer.OhMyPosh -s winget
```

Restart your terminal after installation, then verify:

```powershell
oh-my-posh version
```

---

## 2. Install a Nerd Font

Oh My Posh themes use special glyphs that require a Nerd Font. Run **as Administrator**:

```powershell
oh-my-posh font install CascadiaCode
```

This installs **CaskaydiaCove Nerd Font** (the Nerd Font build of Cascadia Code). To browse all available fonts interactively, omit the name:

```powershell
oh-my-posh font install
```

---

## 3. Configure Windows Terminal to Use the Nerd Font

Open Windows Terminal settings with `Ctrl+,`, go to your profile > Appearance > Font face, and select your installed Nerd Font.

Or edit `settings.json` directly (`Ctrl+,` then click the JSON icon in the bottom left). Find your profile in the `list` array and add:

```json
"font": {
    "face": "CaskaydiaCove Nerd Font"
}
```

---

## 4. Configure the PowerShell Profile

Open your profile for editing:

```powershell
notepad $PROFILE
```

If the file doesn't exist yet, create it first:

```powershell
New-Item -Path $PROFILE -ItemType File -Force
```

Add this line, replacing `atomic` with your chosen theme name:

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression
```

---

## 5. Reload the Profile

Apply changes without restarting:

```powershell
. $PROFILE
```

---

## Changing Themes

Preview all installed themes rendered in your terminal:

```powershell
Get-PoshThemes
```

Test a theme live without saving:

```powershell
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\tokyo.omp.json" | Invoke-Expression
```

To make it permanent, update the theme filename in your `$PROFILE`. All themes are stored in `$env:POSH_THEMES_PATH`.

---

## Troubleshooting

**Icons show as boxes or `?` characters**

- The Nerd Font is not installed, or the terminal is not configured to use it.
- Confirm the font installed correctly:
  ```powershell
  [System.Drawing.Text.InstalledFontCollection]::new().Families | Where-Object Name -match "Nerd"
  ```
- Make sure the font name in your terminal settings matches the name returned above exactly.

**Profile not loading / theme not applying**

- Run `. $PROFILE` and check for error output.
- Confirm the profile path exists: `Test-Path $PROFILE`
- Make sure `oh-my-posh` is on your PATH: `(Get-Command oh-my-posh).Source`
