# Vim Notes

> Yes, this was written in vim.

---

## Outside the Editor

```bash
vim --version        # show version
vim file +42         # open file at line 42
vim file +1,2d +wq   # open file, delete lines 1-2, save and quit
vim -d file1 file2   # open in diff mode
```

---

## Modes

Vim has four main modes:

| Mode | How to Enter | How to Exit |
| --- | --- | --- |
| **Normal** | Default / `Esc` / `Ctrl+C` | — |
| **Insert** | `i` (before cursor), `a` (after), `o` (new line below), `O` (new line above), `I` (start of line), `A` (end of line) | `Esc` |
| **Visual** | `v` (character), `V` (line), `Ctrl+V` (block) | `Esc` |
| **Command-line** | `:` | `Esc` or `Enter` to run |
| **Replace** | `R` | `Esc` |

---

## Normal Mode — Movement

### Basic

| Key | Action |
| --- | --- |
| `h` | Move left |
| `l` | Move right |
| `j` | Move down |
| `k` | Move up |
| `w` | Move to beginning of next word |
| `e` | Move to end of current/next word |
| `b` | Move to beginning of previous word |
| `0` | Move to beginning of line |
| `$` (`Shift+4`) | Move to end of line |
| `^` | Move to first non-blank character of line |
| `gg` | Move to beginning of file |
| `G` (`Shift+G`) | Move to end of file |
| `42G` or `:42` | Go to line 42 |
| `%` | Jump to matching bracket/paren/brace |

### By Sentence / Paragraph

| Key | Action |
| --- | --- |
| `(` | Move to previous sentence |
| `)` | Move to next sentence |
| `{` | Move to previous paragraph |
| `}` | Move to next paragraph |

### By Page

| Key | Action |
| --- | --- |
| `Ctrl+F` | Move forward one page |
| `Ctrl+B` | Move backward one page |
| `Ctrl+D` | Move down half a page |
| `Ctrl+U` | Move up half a page |
| `zz` | Center cursor on screen |
| `zt` | Cursor to top of screen |
| `zb` | Cursor to bottom of screen |

### Word Search

| Key | Action |
| --- | --- |
| `*` (`Shift+8`) | Jump to next occurrence of word under cursor |
| `#` | Jump to previous occurrence of word under cursor |
| `n` | Next search result |
| `N` (`Shift+N`) | Previous search result |

### Jump List

| Key | Action |
| --- | --- |
| `Ctrl+O` | Go back one jump (older position) |
| `Ctrl+I` | Go forward one jump (newer position) |
| `''` (two single quotes) | Jump to last position before last jump |
| `'.` (quote + period) | Jump to last changed line |

### Splits / Windows

| Key | Action |
| --- | --- |
| `Ctrl+W S` | Horizontal split |
| `Ctrl+W V` | Vertical split |
| `Ctrl+W W` | Switch between windows |
| `Ctrl+W H/J/K/L` | Move to window left/down/up/right |
| `Ctrl+G` | Show current file and line number |

---

## Normal Mode — Editing

### Number Prefix

Typing a number before a motion or command repeats it that many times.

Example: `11j` moves down 11 lines, `3dw` deletes 3 words.

### Delete

| Key | Action |
| --- | --- |
| `x` | Delete character under cursor |
| `dw` | Delete word (forward) |
| `db` | Delete word (backward) |
| `dd` | Delete line |
| `d$` | Delete to end of line |
| `d0` | Delete to beginning of line |
| `d)` | Delete to end of sentence |
| `dG` | Delete from current line to end of file |
| `u` | Undo |
| `Ctrl+R` | Redo |
| `.` | Repeat last change |

### Change (delete + enter Insert mode)

| Key | Action |
| --- | --- |
| `cw` | Change word |
| `cc` | Change entire line |
| `c$` | Change to end of line |
| `c/text` | Change everything up to `text` |
| `r` | Replace single character under cursor |
| `R` | Enter Replace mode (overwrite) |

### Text Objects (use with `d`, `c`, `y`)

| Key | Action |
| --- | --- |
| `ci"` | Change inside double quotes |
| `ci'` | Change inside single quotes |
| `ci(` | Change inside parentheses |
| `ci{` | Change inside curly braces |
| `ca"` | Change around double quotes (includes the quotes) |
| `di(` | Delete inside parentheses |
| `yi"` | Yank inside double quotes |

### Indent

| Key | Action |
| --- | --- |
| `>>` | Indent line right |
| `<<` | Indent line left |
| `=G` | Auto-indent from cursor to end of file |

---

## Copy and Paste (Yank)

| Key | Action |
| --- | --- |
| `y` | Yank (copy) selection (use with motion, e.g. `yw`) |
| `yy` | Yank current line |
| `y$` | Yank to end of line |
| `p` | Paste after cursor |
| `P` | Paste before cursor |

---

## Registers

Registers store text for later use. Up to 52 registers (`a`–`z`, `A`–`Z`).

1. Enter `"` + a letter to open a register (e.g., `"a`)
2. Use `y`, `yy`, or a visual selection to copy into it
3. Use `"a p` to paste from register `a`
4. Delete commands also write to registers

Special registers:

- `"0` — last yank
- `"*` / `"+` — system clipboard
- `""` — unnamed (default) register
- `":` — last command
- `"/` — last search

---

## Marks

| Key | Action |
| --- | --- |
| `m[char]` | Set mark at current position (lowercase = local to buffer, uppercase = global across buffers) |
| `'[char]` | Jump to line of mark |
| `` `[char] `` | Jump to exact position of mark |
| `'.` | Jump to last changed line |

---

## Macros

| Key | Action |
| --- | --- |
| `q[char]` | Start recording macro into register `[char]` |
| `q` | Stop recording |
| `@[char]` | Play back macro |
| `@@` | Repeat last macro |
| `5@a` | Run macro `a` five times |

---

## Visual Mode

| Key | Action |
| --- | --- |
| `v` | Character-wise selection |
| `V` | Line-wise selection |
| `Ctrl+V` | Block selection |
| `d` / `x` | Delete selection |
| `y` | Yank selection |
| `c` | Change selection |
| `>` / `<` | Indent / de-indent selection |

---

## Command-Line Mode (`:`)

### File Operations

| Command | Action |
| --- | --- |
| `:q` / `:quit` | Quit (fails if unsaved changes) |
| `:q!` | Quit without saving |
| `:qa!` | Quit all buffers without saving |
| `:w` | Save |
| `:w filename` | Save as new filename |
| `:wq` or `:x` | Save and quit |
| `:wq!` | Force save and quit |

### Buffers

| Command | Action |
| --- | --- |
| `:e filename` | Open file (tab completion supported) |
| `:e!` | Reload current buffer from disk |
| `:bd` | Close buffer |
| `:ls` | List open buffers |
| `:b #` | Switch to buffer by number |
| `:bn` | Next buffer |
| `:bp` | Previous buffer |

### Windows / Splits

| Command | Action |
| --- | --- |
| `:split` or `:sp` | Horizontal split |
| `:vsplit` or `:vsp` | Vertical split |
| `:split filename` | Open file in horizontal split |
| `:close` | Close current window |
| `:only` | Close all windows except current |

### Tabs

| Command | Action |
| --- | --- |
| `:tabnew` | Open new tab |
| `:tabn` | Next tab |
| `:tabp` | Previous tab |
| `:tabclose` | Close tab |

### Search and Replace

| Command | Action |
| --- | --- |
| `/pattern` | Search forward (supports regex) |
| `?pattern` | Search backward |
| `:s/old/new` | Replace first occurrence on current line |
| `:s/old/new/g` | Replace all occurrences on current line |
| `:s/old/new/gc` | Replace all with confirmation |
| `:%s/old/new/g` | Replace all occurrences in entire file |
| `:%s/old/new/gi` | Replace all, case-insensitive |
| `:noh` | Clear search highlighting |

### Reading Files / Commands

| Command | Action |
| --- | --- |
| `:r filename` | Insert contents of file below cursor |
| `:-1r filename` | Insert contents above cursor |
| `:42r filename` | Insert contents at line 42 |
| `:r !command` | Insert output of shell command |

### Diff Mode

| Command | Action |
| --- | --- |
| `:diffsplit filename` | Open diff horizontally |
| `:vert diffsplit filename` | Open diff vertically |
| `do` | Diff obtain (pull change from other window) |
| `dp` | Diff put (push change to other window) |
| `]c` | Next difference |
| `[c` | Previous difference |

### Other

| Command | Action |
| --- | --- |
| `:set number` | Show line numbers |
| `:set nonumber` | Hide line numbers |
| `:set hlsearch` | Highlight search results |
| `:set ignorecase` | Case-insensitive search |
| `:set smartcase` | Case-insensitive unless capital used |
| `:syntax on` | Enable syntax highlighting |
| `:help` | Open help |
| `:help [topic]` | Help on specific topic |
| `:gf` | Open file/URL under cursor |

---

## Zip Files

```bash
vi file.zip    # browse zip contents directly (requires zip/unzip installed)
```

---

## `.vimrc` Configuration

Located at `~/.vimrc`. Uses Vimscript syntax. `"` starts a comment.

```vim
set number              " show line numbers
set hlsearch            " highlight search results
set ignorecase          " case-insensitive search
set smartcase           " override ignorecase if search has capitals
set incsearch           " show matches while typing search
set autoindent          " auto-indent new lines
set expandtab           " use spaces instead of tabs
set tabstop=4           " tab width
set shiftwidth=4        " indent width
syntax on               " syntax highlighting
```

### Key Mappings

```vim
noremap <new_key> <old_key_combo>

" Example: map Space to Ctrl+F (page down)
noremap <SPACE> <C-F>

" Example: map jk to Esc in insert mode
inoremap jk <Esc>
```

### Abbreviations

```vim
abb abbr expansion      " typing 'abbr' expands to 'expansion'
```

Use `Ctrl+V` to insert the abbreviation literally without expanding.

### Custom Commands

```vim
comm! CommandName !shell_command %    " % = current file
```

---

## Quick Reference Card

```
MOVEMENT        |  EDITING          |  FILE
gg = top        |  i  = insert      |  :w  = save
G  = bottom     |  a  = append      |  :q  = quit
0  = line start |  o  = new line ↓  |  :wq = save+quit
$  = line end   |  dd = delete line |  :e  = open file
w  = next word  |  yy = copy line   |
b  = prev word  |  p  = paste       |
/  = search     |  u  = undo        |
n  = next hit   |  .  = repeat      |
```

---

> **Tip:** Run `vimtutor` in the terminal for an interactive tutorial.
