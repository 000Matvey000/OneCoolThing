# Advanced Bash

Back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Advanced Bash](#advanced-bash)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [coproc](#coproc)
  - [debugging scripts](#debugging-scripts)
    - [bash options](#bash-options)
  - [traps](#traps)
  - [eval](#eval)
  - [exec](#exec)
  - [getopts](#getopts)

## coproc

The `coproc` command is used to create a coprocess. A coprocess is a shell command that runs asynchronously with the script. It is used to communicate with the script using file descriptors.

```bash

# first script

while read line;
do
    echo $line | tr 'a-z' 'A-Z';
done

# second script

coproc mycoproc { ./script1.sh; }
# if you don't give a name to the coprocess, it will be named COPROC

# write to the coprocess

echo "hello" >&"${mycoproc[1]}"
# or get the number of the file descriptor
echo ${mycoproc[1]} # will output the file descriptor number
echo "hello" >& <file descriptor number>

# read from the coprocess

cat <&"${mycoproc[0]}"
# or get the number of the file descriptor
echo ${mycoproc[0]} # will output the file descriptor number
cat <& <file descriptor number>

# see what jobs are running

jobs

# kill the coprocess

kill %1 # the 1 is the job number

```

## debugging scripts

### bash options

`bash -x script.sh` - run the script in debug mode, showing each command as it is executed

`set -x` - turn on debugging in the script

`set +x` - turn off debugging in the script

`bash -n script.sh` - check the syntax of the script

`set -n` - turn on syntax checking in the script

`set -e` - exit the script if a command fails

`set -u` - exit the script if an undefined variable is used

## traps

The `trap` command is used to catch signals and run a command when a signal is received.

```bash

trap 'echo "kill 2"' SIGINT # caused by Ctrl+C or kill -2

trap 'echo "Exit signal"' EXIT # when the script exits

trap 'echo "signal received"' ERR # when an error occurs

trap 'echo "quit received and exit"' SIGQUIT # caused by Ctrl+\

# nested traps

trap 'echo "trap 1"; trap - SIGINT' SIGINT

```

## eval

The `eval` command is used to evaluate a string as a command. It will execute the command in the string.

```bash

var="ls -l"

eval $var

```

## exec

The `exec` command is used to replace the current shell with a new command. It is used to run a command without creating a new process.

```bash

exec ls -l

```

## getopts

The `getopts` command is used to parse command-line options in a script.

```bash

while getopts ":a:b:" opt;

do
    case $opt in
        a) echo "option a: $OPTARG";;
        b) echo "option b: $OPTARG";;
        \?) echo "invalid option: $OPTARG";;
    esac
done

```
