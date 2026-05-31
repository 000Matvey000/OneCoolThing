# Basics of Shell Scripting (bash)

back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Basics of Shell Scripting (bash)](#basics-of-shell-scripting-bash)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [shebang](#shebang)
  - [Permissions](#permissions)
  - [timing commands](#timing-commands)
  - [Variables](#variables)
  - [unset - remove a variable](#unset---remove-a-variable)
  - [export - make a variable available to subshells](#export---make-a-variable-available-to-subshells)
  - [declare - declare a variable](#declare---declare-a-variable)
  - [env - display environment variables](#env---display-environment-variables)
  - [grouping in bash {} vs ()](#grouping-in-bash--vs-)
  - [enable - list all built-in commands](#enable---list-all-built-in-commands)
  - [compgen - list all commands, keywords, aliases, and functions](#compgen---list-all-commands-keywords-aliases-and-functions)
  - [sleep - pause the script](#sleep---pause-the-script)
  - [.bashrc and .bash\_profile files](#bashrc-and-bash_profile-files)
  - [source scripts](#source-scripts)
  - [alias/unalias](#aliasunalias)
  - [echo - print to the terminal](#echo---print-to-the-terminal)
  - [exit and return](#exit-and-return)
  - [redirection](#redirection)
  - [here documents](#here-documents)
  - [Open and Close File Descriptors](#open-and-close-file-descriptors)
    - [lsof](#lsof)

## shebang

`#!/bin/[shell]` - The first line of a script

This tells the kernal system to execute program (shell) that is specifed in the path. eg. `#!/bin/bash`, `#!/bin/sh`, `#!/bin/zsh`.

The script file is passed to the shell program for execution, eg. `#!/bin/bash script.sh` will execute the script file `script.sh` using the bash shell. Putting !#/bin/bash is equivalent to running `bash script.sh` in the terminal. This works the same for Python, Ruby, Perl, etc.

## Permissions

For you to run the script: 500 (r-x------) is the minimum permission required. You can also use `bash script.sh` to run the script if you have read permission.

## timing commands

The `time` command is used to determine how long a command takes to run. It is used to determine the duration of a command.

The output of the `time` command is displayed in three lines:

1. real: the actual time taken by the command to execute.
2. user: user space time
3. sys: kernal time

```bash

time ls -l

```

## Variables

Variables are used to store data. They are used to store data that can be used later in the script. Variables are assigned using the `=` operator, with no spaces between the variable name, the `=` operator, and the value. eg. `var=10`.

If the value has spaces, you can use quotes to enclose the value. eg. `var="Hello World"`.

```bash

var=10
echo $var

var="Hello World"
echo $var

var="This is a quote, \"Hello World\"" # escaping quotes

# adding to a variable (concatenation)

var="Hello"
var=$var" World"
#or
var=$var:morestuff

```

## unset - remove a variable

The `unset` command is used to remove a variable from the shell.

```bash

var=10
echo $var

unset var

```

## export - make a variable available to subshells

Export a variable to make it available to subshells or new processes.

```bash

export var=10; # declare and export at the same time
echo $var

var=20; export var; # declare and export separately
mystring=$(echo $var); # subshell

# check if the variable is available in the subshell

env | grep var
# or
export | grep var

# you can also export functions

function myfunction() {
    echo "Hello World"
}

export -f myfunction

```

## declare - declare a variable

The `declare` command is used to declare a variable. It is used to set the attributes of a variable.

```bash

declare -i var=10; # declare an integer
declare -r var=10; # declare a read-only variable
declare -a var=(1 2 3 4 5); # declare an array
declare -f function_name; # declare a function
declare -x var=10; # declare an environment variable (export)


```

## env - display environment variables

The `env` command is used to display the environment variables.

```bash

env

```

## grouping in bash {} vs ()

You can group commands in bash using `{}`.

```bash

{
    var=10;
}

echo $var # wii output 10, braces simply group commands

(
    var=20;
)

echo $var # will output 10, because the variable is in a subshell (a new process)

```

## enable - list all built-in commands

i
The `enable` command is used to list all built-in commands.

bash will look for builtin commands, then keywords, then aliases, then functions, then binaries in the PATH variable.

```bash

enable

```

## compgen - list all commands, keywords, aliases, and functions

The `compgen` command is used to list all commands, keywords, aliases

```bash

compgen -c # list all commands
compgen -k # list all keywords
compgen -a # list all aliases

```

## sleep - pause the script

The `sleep` command is used to pause the script for a specified amount of time.

```bash

time sleep 5 # pause the script for 5 seconds

```

## .bashrc and .bash_profile files

The .bash_profile files is read when bash is invoked as a login shell. A login shell is a shell that is started when you log in to the system.

The .bashrc file is read when a new shell is started. If you keep opening up shells, any variables exported in the .bashrc file will keep getting exported.

Thus environment variables should be exported in the .bash_profile file, and aliases and functions should be exported in the .bashrc file.

## source scripts

Is handy when you want to run a script in the current shell and keep the variables and functions in the current shell.

```bash

source script.sh
echo $varfromscript # will output the variable from the script
# or 
. script.sh
echo $varfromscript # will output the variable from the script

./script.sh 
echo $varfromscript # will not output the variable from the script

```

## alias/unalias

An alias is a way to create a shortcut for a command. It is used to create a new name for a command. It is used to create a new name for a command or a sequence of commands.

```bash

alias ll='ls -l'

unalias ll

```

## echo - print to the terminal

The `echo` command is used to print a message to the terminal.

```bash

echo "Hello World"

echo -e "Hello\nWorld" # enable interpretation of backslash escapes (eg. \n, \t, \b)

echo -E "Hello\nWorld" # disable interpretation of backslash escapes

echo -n "Hello World" # do not print a newline

echo * # print all files in the current directory

```

## exit and return

The `exit` command is used to exit the shell.

```bash

exit

```

Exit codes are used to indicate the success or failure of a command. The exit code is stored in the `$?` variable.

```bash

ls

echo $?

```

Anything other than 0 is considered an error. The exit code is used to determine the success or failure of a command. The exit code is stored in the `$?` variable.

The `return` statement is used to return a value from a function. The return value is stored in the `$?` variable or you can store it in a variable.

```bash

function myfunction {
    return 10
}

var=$(myfunction) # store the return value in a variable

```

## redirection

Redirection is used to change the input and output of a command. It is used to redirect the output of a command to a file or another command.

`>` is used to redirect the output of a command to a file. If the file does not exist, it will be created. If the file exists, it will be overwritten.

`>>` is used to append the output of a command to a file. If the file does not exist, it will be created. If the file exists, the output will be appended to the file.

`<` is used to redirect the input of a command from a file.

`|` is used to pipe the output of one command to the input of another command.

`2>&1` is used to redirect the standard error to the standard output.
eg. `ls -l /etc/passwd /etc/nonexistent 2>&1 | grep 'No such file'`

`&>` is used to redirect both the standard output and standard error to a file.
eg. `ls -l /etc/passwd /etc/nonexistent &> output.txt`

`&>>` is used to append both the standard output and standard error to a file.
eg. `ls -l /etc/passwd /etc/nonexistent &>> output.txt`

`|&` is used to pipe the standard output and standard error of a command to another command.
eg. `ls -l /etc/passwd /etc/nonexistent |& grep 'No such file'`

## here documents

Here documents are used to redirect the input of a command from a block of text. It is used to pass a block of text to a command.

```bash
# cat will read until it encounters the END marker
cat <<END
Hello
World
END

while read line; do
    echo $line
done <<END
Hello
World
END

```

## Open and Close File Descriptors

`exec 3< file.txt` - open file.txt for reading on file descriptor 3

`exec 4> file.txt` - open file.txt for writing on file descriptor 4

`exec 5<> file.txt` - open file.txt for reading and writing on file descriptor 5

`exec 3<&-` - close file descriptor 3
or (does the same thing)
`exec 4>&-` - close file descriptor 4

### lsof

`lsof -p $$` - list all open file descriptors for the current shell
