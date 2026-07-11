#!/bin/zsh
#
# palm-anim.zsh — an animated, swaying palm tree
# Fronds sway left<->right, coconuts jiggle, sand shimmers.
# Ctrl-C to quit (cursor is restored on exit).

# ---- palette (real ESC bytes) ----
PG=$'\e[38;5;40m'    # palm green
DG=$'\e[38;5;22m'    # dark green midrib
CO=$'\e[38;5;130m'   # coconut
NUT=$'\e[38;5;94m'   # coconut shade
BK=$'\e[38;5;94m'    # bark
DB=$'\e[38;5;58m'    # dark bark
SND=$'\e[38;5;223m'  # sand
SUN=$'\e[38;5;220m'  # sun
SKY=$'\e[38;5;51m'   # sky sparkle
R=$'\e[0m'

# ---- terminal setup: hide cursor, restore on exit ----
tput civis 2>/dev/null
cleanup() { tput cnorm 2>/dev/null; print -r -- "${R}"; clear; exit 0 }
trap cleanup INT TERM

clear

# ---------- three sway frames (0=left, 1=center, 2=right) ----------
draw_frame() {
  local f=$1
  # move cursor to top-left instead of clearing (no flicker)
  print -rn -- $'\e[H'

  # ---- sky + sun (static-ish shimmer) ----
  if (( f == 1 )); then
    print -r -- "${SUN}     \\   |   /       ${SKY}. ${R}          "
    print -r -- "${SUN}      .-'''-.        ${R}             "
    print -r -- "${SUN}   -- (  ${SUN}o  ) --   ${SKY}  * ${R}        "
    print -r -- "${SUN}      '-...-'         ${R}            "
    print -r -- "${SUN}     /   |   \\        ${SKY}.${R}           "
  else
    print -r -- "${SUN}     \\   |   /     ${SKY}  * ${R}          "
    print -r -- "${SUN}      .-'''-.       ${R}             "
    print -r -- "${SUN}   -- (  ${SUN}o  ) --   ${SKY}. ${R}        "
    print -r -- "${SUN}      '-...-'      ${SKY}  . ${R}          "
    print -r -- "${SUN}     /   |   \\        ${R}           "
  fi

  # ---- palm crown: three sway positions ----
  case $f in
    0)  # leaning LEFT
      print -r -- "${PG}   \\\\\\\\,  \\\\\\\\,  \\\\\\\\, \\\\ | ${DG}|${PG} /                 "
      print -r -- "${PG} '~,,,${DG},,,,,,,,,,${PG}\\\\${DG}\\|/${PG}/,,,~'               "
      print -r -- "${PG}   //'   //'  //' /${DG}/|\\${PG}\\  '\\\\  '\\\\           "
      print -r -- "${PG}  //'   //'      / ${DG}|${PG} \\   '\\\\               "
      ;;
    1)  # CENTER / upright
      print -r -- "${PG}      \\\\.   \\  ${DG}|${PG}  /   ./                    "
      print -r -- "${PG} '~,,,,${DG},,,,,,,${PG}\\\\${DG}\\|/${PG}//${DG},,,,,,,${PG},,,~'         "
      print -r -- "${PG}    //''  //' /${DG}/|\\${PG}\\ '\\\\  ''\\\\             "
      print -r -- "${PG}   //''      / ${DG}|${PG} \\    ''\\\\                 "
      ;;
    2)  # leaning RIGHT
      print -r -- "${PG}          \\ ${DG}|${PG} // ,,// ,,// ,,//           "
      print -r -- "${PG}       '~,${DG},,,${PG}\\\\${DG}\\|/${PG}//${DG},,,,,,,,,,${PG},,,~'      "
      print -r -- "${PG}       /'  /  ${DG}/|\\${PG} \\  '\\\\  '\\\\   '\\\\        "
      print -r -- "${PG}          /   ${DG}|${PG}  \\   '\\\\   ''\\\\            "
      ;;
  esac

  # ---- coconuts (jiggle with the sway) ----
  case $f in
    0) print -r -- "${CO}        (${NUT}@${CO})(${NUT}@${CO})                          " ;;
    1) print -r -- "${CO}          (${NUT}@${CO})(${NUT}@${CO})                        " ;;
    2) print -r -- "${CO}            (${NUT}@${CO})(${NUT}@${CO})                      " ;;
  esac

  # ---- trunk (curves toward the lean) ----
  case $f in
    0)
      print -r -- "${BK}         ${DB})|(${BK}                            "
      print -r -- "${BK}        ${DB}(|)${BK}                             "
      print -r -- "${BK}         ${DB})|(${BK}                            "
      print -r -- "${BK}        ${DB}(|)${BK}                             "
      print -r -- "${BK}         ${DB})|(${BK}                            "
      ;;
    1)
      print -r -- "${BK}          ${DB})|(${BK}                           "
      print -r -- "${BK}          ${DB}(|)${BK}                           "
      print -r -- "${BK}          ${DB})|(${BK}                           "
      print -r -- "${BK}          ${DB}(|)${BK}                           "
      print -r -- "${BK}          ${DB})|(${BK}                           "
      ;;
    2)
      print -r -- "${BK}          ${DB})|(${BK}                           "
      print -r -- "${BK}           ${DB}(|)${BK}                          "
      print -r -- "${BK}           ${DB})|(${BK}                          "
      print -r -- "${BK}            ${DB}(|)${BK}                         "
      print -r -- "${BK}            ${DB})|(${BK}                         "
      ;;
  esac

  # ---- sand (shimmer shifts each frame) ----
  case $f in
    0) print -r -- "${SND}  .·°·.,·°·.,·°·.,·°·.,·°·.,·°·.,·°·.,·°·. " ;;
    1) print -r -- "${SND}  ·,.°·,.°·,.°·,.°·,.°·,.°·,.°·,.°·,.°·,.°· " ;;
    2) print -r -- "${SND}  ,·°·.,·°·.,·°·.,·°·.,·°·.,·°·.,·°·.,·°·., " ;;
  esac
  print -r -- "${SND} __~~__~~__~~__~~__~~__~~__~~__~~__~~__~~__ ${R}"
}

# ---------- animation loop: 0->1->2->1->... (natural back-and-forth) ----------
seq_frames=(0 1 2 1)
while true; do
  for f in $seq_frames; do
    draw_frame $f
    sleep 0.18
  done
done
