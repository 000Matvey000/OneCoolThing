# ~/.gnome_pipe.zsh — pixel-art gnome smoking a pipe, shown on new terminal tabs.
# Sourced from ~/.zshrc. Safe to `rm` and remove the source line to undo.

_gnome_splash() {
  emulate -L zsh
  [[ -o interactive ]] || return
  [[ -t 1 ]] || return
  (( $(tput colors 2>/dev/null || echo 0) >= 256 )) || return

  local -a rows
  rows=(
    '..............RR..............................'
    '.............RRRR.............................'
    '............RRRRRR....................gg......'
    '...........RRRRRRRr.....................gg....'
    '..........RRRRRRRRrr.....................gg...'
    '.........RRRRRRRRRrrr...................gg....'
    '........RRRRRRRRRRrrrr................gg......'
    '.......RRRRRRRRRRRrrrrr..............gg.......'
    '......RRRRRRRRRRRRRRrrrr..............gg......'
    '.....rrRRRRRRRRRRRRRRrrrrr..............gg....'
    '....rrrrrrrrrrrrrrrrrrrrrr................gg..'
    '.....rSSSSSSSSSSSSSSSSSSSSr...............gg..'
    '.....SSSSSSSSSSSSSSSSSSSSSS.............gg....'
    '.....SWWWWWSSSSSSWWWWWS...............gg......'
    '.....SSSKKSSSSSSSSKKSSS..............gg.......'
    '.....SSSSSSSSSSSSSSSSSSSSSS...........gg......'
    '.........SSSSSnnnnSSSSS.................gg....'
    '.........SSSSnnnnnnSSSS...................gg..'
    '...WWWWWWWWWWWWWWWWWWWWWWWWWW.............gg..'
    '..WWWWWWWWWWWWWWWWWWWWWWWWWWWW...........gg...'
    '...WWWWWWWWWWWWWBBBBWWWWWWWWW.................'
    '......WWWWWWWWWWWWWWWWWWWWWW....BBBBBB........'
    '.......SSSSWWWWWWWWWWWWWW...BBBBBBBBbb........'
    '.......SSSSSWWWWWWWWWWWWW.....bbbbbbbb........'
    '..WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW..............'
    '.WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.............'
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW............'
    '.WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW...............'
    '..WWWWWWWWWWWWWWWWWWWWWWWWWW..................'
    '....WWWWWWWWWWWWWWWWWWWW......................'
    '..TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT..............'
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT............'
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT..........'
    'TTTTTTTTTTTTTTTYYYYYYTTTTTTTTTTTTTtttt........'
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT............'
    'tttttttttttttttttttttttttttttttttt............'
  )

  local -A fg
  fg=(
    R 160  r 88   S 223  s 180  W 231  K 16
    n 216  B 94   b 58   g 250  T 22   t 28  Y 220
  )

  local -a quotes
  quotes=(
    "Pack the bowl, mind the toadstools."
    "A gnome's beard grows longer with every good pipe."
    "Mushrooms, embers, and a slow smoke ring."
    "The garden keeps its secrets; the pipe keeps its smoke."
  )

  local row line ch code i
  for row in "${rows[@]}"; do
    line=""
    for (( i = 1; i <= ${#row}; i++ )); do
      ch="${row[i]}"
      if [[ "$ch" == "." ]]; then
        line+="  "
      else
        code="${fg[$ch]}"
        line+=$'\e[48;5;'"${code}"$'m  \e[0m'
      fi
    done
    print -r -- "$line"
  done

  print
  print -P "%F{136}   \"${quotes[$(( RANDOM % ${#quotes[@]} + 1 ))]}\"%f"
  print
}

_gnome_splash
unfunction _gnome_splash
