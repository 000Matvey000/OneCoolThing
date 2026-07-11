#!/bin/zsh
#
# tux-jump.zsh — Tux the penguin hopping around the screen
# Squash on landing, stretch mid-air, flapping flippers, bobbing shadow.
# Ctrl-C to quit (cursor restored on exit).

# ---- palette (real ESC bytes) ----
BLK=$'\e[38;5;16m'    # black body
WHT=$'\e[1;37m'       # white belly
ORG=$'\e[38;5;208m'   # orange beak/feet
EYE=$'\e[1;37m'       # eye white
SHD=$'\e[38;5;240m'   # shadow
GRS=$'\e[38;5;34m'    # grass
SKY=$'\e[38;5;51m'    # sparkle
R=$'\e[0m'

# ---- terminal setup ----
tput civis 2>/dev/null
cleanup() { tput cnorm 2>/dev/null; print -r -- "${R}"; clear; exit 0 }
trap cleanup INT TERM
clear

COLS=48   # play-field width

# ---------- Tux poses ----------
# Each pose = array of 7 body lines; we pad on the left for x-position,
# and drop the pose down/up with blank lines for jump height.

# Pose A: CROUCH (squashed, about to launch) — feet flat, wings down
poseA() {
  print -r -- "${BLK}   .--.   "
  print -r -- "${BLK}  /${EYE}o${BLK}  ${EYE}o${BLK}\\  "
  print -r -- "${BLK}  |${ORG}<${BLK}   |  "
  print -r -- "${BLK} /${WHT}______${BLK}\\ "
  print -r -- "${BLK}/${WHT}________${BLK}\\ "
  print -r -- "${BLK}\\${WHT}________${BLK}/ "
  print -r -- "${ORG} ^^    ^^ "
}

# Pose B: STRETCH (airborne, wings up, feet tucked)
poseB() {
  print -r -- "${BLK}\\  .--.  /"
  print -r -- "${BLK} \\/${EYE}o${BLK} ${EYE}o${BLK}\\/ "
  print -r -- "${BLK}  |${ORG}<${BLK}  | "
  print -r -- "${BLK}  |${WHT}____${BLK}| "
  print -r -- "${BLK} /${WHT}______${BLK}\\ "
  print -r -- "${BLK} \\${WHT}______${BLK}/ "
  print -r -- "${ORG}   ^^^^   "
}

# Pose C: NEUTRAL (standing, mid-hop transition) — wings mid, feet apart
poseC() {
  print -r -- "${BLK}   .--.   "
  print -r -- "${BLK}  /${EYE}o${BLK}  ${EYE}o${BLK}\\  "
  print -r -- "${BLK} (|${ORG}<${BLK}   |) "
  print -r -- "${BLK}  |${WHT}____${BLK}|  "
  print -r -- "${BLK} /${WHT}______${BLK}\\ "
  print -r -- "${BLK} \\${WHT}______${BLK}/ "
  print -r -- "${ORG}  ^^  ^^  "
}

# ---------- render a full frame ----------
# args: pose_fn  x_pad  air_gap(blank lines above)  facing(l/r)
draw() {
  local pose=$1 xpad=$2 air=$3
  local pad; pad=${(l:$xpad:: :)}   # xpad spaces

  print -rn -- $'\e[H'   # cursor home (no clear = no flicker)

  # ---- top sparkles ----
  print -r -- "${SKY}   .        *        .      *      .        *   ${R}   "

  # ---- air gap (jump height): blank lines push Tux down when grounded ----
  local sky_lines=$(( 4 - air ))     # more air => fewer blank lines above
  local i
  for (( i=0; i<sky_lines; i++ )); do
    print -r -- "                                                  "
  done

  # ---- Tux body (7 lines, left-padded to x position) ----
  local line
  ${pose} | while IFS= read -r line; do
    print -r -- "${pad}${line}                    "
  done

  # ---- ground filler below Tux ----
  local ground_lines=$(( air ))
  for (( i=0; i<ground_lines; i++ )); do
    print -r -- "                                                  "
  done

  # ---- bobbing shadow (shrinks when airborne) ----
  local spad; spad=${(l:$(( xpad+1 )):: :)}
  if (( air >= 2 )); then
    print -r -- "${spad}${SHD}  ~-__-~   ${R}                          "   # small shadow (high jump)
  elif (( air == 1 )); then
    print -r -- "${spad}${SHD} (_______) ${R}                          "   # medium shadow
  else
    print -r -- "${spad}${SHD}(_________)${R}                          "   # wide shadow (grounded)
  fi

  # ---- grassy ground ----
  print -r -- "${GRS} \\|/,\\|/,\\|/,\\|/,\\|/,\\|/,\\|/,\\|/,\\|/,\\|/,\\|/, ${R}"
  print -r -- "${GRS}^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ${R}"
}

# ---------- one hop = crouch -> stretch(up) -> neutral(land) ----------
# We move Tux rightward, then bounce back leftward for a "jumping around" feel.
hop_sequence() {
  local dir=$1          # +1 moving right, -1 moving left
  local -a xs
  if (( dir > 0 )); then
    xs=(2 6 10 14 18 22 26 30 34)
  else
    xs=(34 30 26 22 18 14 10 6 2)
  fi
  local x
  for x in $xs; do
    draw poseA $x 0 ; sleep 0.06      # crouch (grounded)
    draw poseB $x 3 ; sleep 0.09      # launch high (stretch)
    draw poseB $x 4 ; sleep 0.06      # peak
    draw poseB $x 3 ; sleep 0.06      # coming down
    draw poseC $x 1 ; sleep 0.06      # land (slight air)
    draw poseA $x 0 ; sleep 0.05      # settle (crouch)
  done
}

# ---------- main loop: bounce right, then left, forever ----------
while true; do
  hop_sequence  1
  hop_sequence -1
done
