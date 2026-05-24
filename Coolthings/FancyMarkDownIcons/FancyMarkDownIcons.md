# Fancy Markdown Icons with shields.io

**Make your README pop with language badges, status icons, and tech stack visuals — zero images, pure URLs.**

---

## What Is shields.io?

[shields.io](https://shields.io) is a free service that generates SVG badges on-the-fly from a URL. You embed them in Markdown as standard `![]()` image syntax — no files to download, no CDN to manage. GitHub renders them inline, so they just work.

---

## The URL Anatomy

```text
https://img.shields.io/badge/<LABEL>-<MESSAGE>-<COLOR>?style=<STYLE>&logo=<LOGO>&logoColor=<LOGO_COLOR>
```

| Part | What it does |
| ---- | ------------ |
| `LABEL` | Left-side text (can be empty — use just `-`) |
| `MESSAGE` | Right-side text |
| `COLOR` | Right-side background — hex (`FF5733`) or named (`blue`, `green`) |
| `style` | Badge shape: `flat`, `flat-square`, `for-the-badge`, `plastic`, `social` |
| `logo` | Icon slug from [Simple Icons](https://simpleicons.org) |
| `logoColor` | Icon tint — hex or `white` / `black` |
| `labelColor` | Left-side background color |

> **Tip:** Special characters in labels need URL-encoding. Spaces → `%20`, `#` → `%23`, `/` → `%2F`. Or just use `-` as a separator — shields.io treats a single `-` as a space.

---

## Three Ways to Embed

### 1. Plain Markdown image

```markdown
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
```

### 2. Clickable badge (image wrapped in a link)

```markdown
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
```

### 3. Raw HTML (useful for centering or sizing)

```html
<img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
```

---

## Style Showcase

Same badge, five styles:

| Style | Preview |
| ----- | ------- |
| `flat` | ![flat style Python badge](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white) |
| `flat-square` | ![flat-square style Python badge](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) |
| `for-the-badge` | ![for-the-badge style Python badge](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) |
| `plastic` | ![plastic style Python badge](https://img.shields.io/badge/Python-3776AB?style=plastic&logo=python&logoColor=white) |
| `social` | ![social style Python badge](https://img.shields.io/badge/Python-3776AB?style=social&logo=python&logoColor=white) |

---

## Programming Languages — Full Badge Table

> All badges below use `style=for-the-badge`. Copy any line directly into your README.

| Language | Badge | Markdown |
| -------- | ----- | -------- |
| Python | ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white) | `![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)` |
| JavaScript | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) | `![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)` |
| TypeScript | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | `![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)` |
| C | ![C](https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=black) | `![C](https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=black)` |
| C++ | ![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white) | `![C++](https://img.shields.io/badge/C%2B%2B-00599C?style=for-the-badge&logo=cplusplus&logoColor=white)` |
| C# | ![C#](https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=dotnet&logoColor=white) | `![C#](https://img.shields.io/badge/C%23-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)` |
| Java | ![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white) | `![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)` |
| Kotlin | ![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white) | `![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)` |
| Swift | ![Swift](https://img.shields.io/badge/Swift-FA7343?style=for-the-badge&logo=swift&logoColor=white) | `![Swift](https://img.shields.io/badge/Swift-FA7343?style=for-the-badge&logo=swift&logoColor=white)` |
| Go | ![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white) | `![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)` |
| Rust | ![Rust](https://img.shields.io/badge/Rust-CE422B?style=for-the-badge&logo=rust&logoColor=white) | `![Rust](https://img.shields.io/badge/Rust-CE422B?style=for-the-badge&logo=rust&logoColor=white)` |
| Ruby | ![Ruby](https://img.shields.io/badge/Ruby-CC342D?style=for-the-badge&logo=ruby&logoColor=white) | `![Ruby](https://img.shields.io/badge/Ruby-CC342D?style=for-the-badge&logo=ruby&logoColor=white)` |
| PHP | ![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white) | `![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)` |
| Scala | ![Scala](https://img.shields.io/badge/Scala-DC322F?style=for-the-badge&logo=scala&logoColor=white) | `![Scala](https://img.shields.io/badge/Scala-DC322F?style=for-the-badge&logo=scala&logoColor=white)` |
| R | ![R](https://img.shields.io/badge/R-276DC3?style=for-the-badge&logo=r&logoColor=white) | `![R](https://img.shields.io/badge/R-276DC3?style=for-the-badge&logo=r&logoColor=white)` |
| Dart | ![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white) | `![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white)` |
| Elixir | ![Elixir](https://img.shields.io/badge/Elixir-4B275F?style=for-the-badge&logo=elixir&logoColor=white) | `![Elixir](https://img.shields.io/badge/Elixir-4B275F?style=for-the-badge&logo=elixir&logoColor=white)` |
| Haskell | ![Haskell](https://img.shields.io/badge/Haskell-5D4F85?style=for-the-badge&logo=haskell&logoColor=white) | `![Haskell](https://img.shields.io/badge/Haskell-5D4F85?style=for-the-badge&logo=haskell&logoColor=white)` |
| Lua | ![Lua](https://img.shields.io/badge/Lua-2C2D72?style=for-the-badge&logo=lua&logoColor=white) | `![Lua](https://img.shields.io/badge/Lua-2C2D72?style=for-the-badge&logo=lua&logoColor=white)` |
| Perl | ![Perl](https://img.shields.io/badge/Perl-39457E?style=for-the-badge&logo=perl&logoColor=white) | `![Perl](https://img.shields.io/badge/Perl-39457E?style=for-the-badge&logo=perl&logoColor=white)` |
| Zig | ![Zig](https://img.shields.io/badge/Zig-F7A41D?style=for-the-badge&logo=zig&logoColor=black) | `![Zig](https://img.shields.io/badge/Zig-F7A41D?style=for-the-badge&logo=zig&logoColor=black)` |
| Julia | ![Julia](https://img.shields.io/badge/Julia-9558B2?style=for-the-badge&logo=julia&logoColor=white) | `![Julia](https://img.shields.io/badge/Julia-9558B2?style=for-the-badge&logo=julia&logoColor=white)` |
| MATLAB | ![MATLAB](https://img.shields.io/badge/MATLAB-0076A8?style=for-the-badge&logo=mathworks&logoColor=white) | `![MATLAB](https://img.shields.io/badge/MATLAB-0076A8?style=for-the-badge&logo=mathworks&logoColor=white)` |
| Bash | ![Bash](https://img.shields.io/badge/Bash-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white) | `![Bash](https://img.shields.io/badge/Bash-4EAA25?style=for-the-badge&logo=gnubash&logoColor=white)` |
| PowerShell | ![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge&logo=powershell&logoColor=white) | `![PowerShell](https://img.shields.io/badge/PowerShell-5391FE?style=for-the-badge&logo=powershell&logoColor=white)` |
| HTML | ![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) | `![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)` |
| CSS | ![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) | `![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)` |
| SQL | ![SQL](https://img.shields.io/badge/SQL-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white) | `![SQL](https://img.shields.io/badge/SQL-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)` |
| Assembly | ![Assembly](https://img.shields.io/badge/Assembly-6E4C13?style=for-the-badge&logo=assemblyscript&logoColor=white) | `![Assembly](https://img.shields.io/badge/Assembly-6E4C13?style=for-the-badge&logo=assemblyscript&logoColor=white)` |
| Clojure | ![Clojure](https://img.shields.io/badge/Clojure-5881D8?style=for-the-badge&logo=clojure&logoColor=white) | `![Clojure](https://img.shields.io/badge/Clojure-5881D8?style=for-the-badge&logo=clojure&logoColor=white)` |
| Erlang | ![Erlang](https://img.shields.io/badge/Erlang-A90533?style=for-the-badge&logo=erlang&logoColor=white) | `![Erlang](https://img.shields.io/badge/Erlang-A90533?style=for-the-badge&logo=erlang&logoColor=white)` |
| F# | ![F#](https://img.shields.io/badge/F%23-378BBA?style=for-the-badge&logo=fsharp&logoColor=white) | `![F#](https://img.shields.io/badge/F%23-378BBA?style=for-the-badge&logo=fsharp&logoColor=white)` |
| Groovy | ![Groovy](https://img.shields.io/badge/Groovy-4298B8?style=for-the-badge&logo=apachegroovy&logoColor=white) | `![Groovy](https://img.shields.io/badge/Groovy-4298B8?style=for-the-badge&logo=apachegroovy&logoColor=white)` |
| OCaml | ![OCaml](https://img.shields.io/badge/OCaml-EC6813?style=for-the-badge&logo=ocaml&logoColor=white) | `![OCaml](https://img.shields.io/badge/OCaml-EC6813?style=for-the-badge&logo=ocaml&logoColor=white)` |
| Nim | ![Nim](https://img.shields.io/badge/Nim-FFE953?style=for-the-badge&logo=nim&logoColor=black) | `![Nim](https://img.shields.io/badge/Nim-FFE953?style=for-the-badge&logo=nim&logoColor=black)` |

---

## Finding the Right Logo Slug

Every logo comes from [Simple Icons](https://simpleicons.org). The slug is just the icon's name, lowercase, no spaces:

- `python`, `javascript`, `typescript`, `rust`, `go`, `cplusplus`, `dotnet` …
- Search the site, copy the slug, drop it into `&logo=<slug>`

If a logo doesn't exist on Simple Icons, shields.io will silently omit it — you'll just get the text badge without an icon.

---

## Quick-Copy: Inline Stack Row

Paste this block at the top of any README for an instant tech-stack row:

```markdown
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
```

Renders as:

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-CE422B?style=flat-square&logo=rust&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Hooking up your github profile

You can query the shields.io API to generate dynamic badges for your GitHub profile. For example, to show your total stars:

```markdown
![GitHub stars](https://img.shields.io/github/stars/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white)
```

This will render as:
![GitHub stars](https://img.shields.io/github/stars/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white)

Other dynamic queries include:

- `https://img.shields.io/github/followers/<username>`
- `https://img.shields.io/github/issues/<username>/<repo>`
- `https://img.shields.io/github/license/<username>/<repo>`
- `https://img.shields.io/github/last-commit/<username>/<repo>`
- `https://img.shields.io/github/commit-activity/m/<username>/<repo>`
- `https://img.shields.io/github/languages/top/<username>/<repo>`
- `https://img.shields.io/github/v/release/<username>/<repo>`
- `https://img.shields.io/github/workflow/status/<username>/<repo>/<workflow>`

These will render as:

| Followers | Issues | License | Last Commit | Commit Activity | Top Language 
| --------- | ------ | ------- | ----------- | --------------- | ------------ |
| ![GitHub followers](https://img.shields.io/github/followers/000Matvey000?style=flat-square&logo=github&logoColor=white) | ![GitHub issues](https://img.shields.io/github/issues/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white) | ![GitHub license](https://img.shields.io/github/license/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white) | ![GitHub last commit](https://img.shields.io/github/last-commit/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white) | ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white) | ![GitHub top language](https://img.shields.io/github/languages/top/000Matvey000/OneCoolThing?style=flat-square&logo=github&logoColor=white) |

Part of [OneCoolThing](../../README.md) · One lesson, one trick, one cool thing.
