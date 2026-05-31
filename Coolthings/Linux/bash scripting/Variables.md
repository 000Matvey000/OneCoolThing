# Variables

Variables are used to store data. They are used to store data that can be used later in the script. Variables are assigned using the `=` operator, with no spaces between the variable name, the `=` operator, and the value. eg. `var=10`.

back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Variables](#variables)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [Declaring Variables](#declaring-variables)
  - [unset - remove a variable](#unset---remove-a-variable)
  - [export - make a variable available to subshells](#export---make-a-variable-available-to-subshells)
  - [typeset - declare a variable with a type](#typeset---declare-a-variable-with-a-type)
  - [declare - declare a variable](#declare---declare-a-variable)

## Declaring Variables

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
```

## typeset - declare a variable with a type

The `typeset` command is used to declare a variable with a type. This is useful when you want to enforce a specific type for a variable.

The variable declared is also local to the script.

```bash

typeset -i var=10; # declare an integer
echo $var # if you try to assign a string, it will be converted to 0

# types include: -i (integer), -r (readonly), -a (array), -f (function), -x (export)

# -r (readonly) - cannot be changed, unset will not work nor will reassignment


```

## declare - declare a variable

The `declare` command is used to declare a variable. It is used to set the attributes of a variable.

The `typeset` command is a synonym for the `declare` command.

```bash

declare -i var=10; # declare an integer

declare -r var=10; # declare a read-only variable

declare -u var="hello world"; # convert to uppercase

declare -l var="HELLO WORLD"; # convert to lowercase

declare -a var=(1 2 3 4 5); # declare an array indexed by integers
# retrieve the value using the index 
echo ${var[0]}

declare -A var=(["key1"]="value1" ["key2"]="value2"); # declare an associative array
# retrieve the value using the key
echo ${var["key1"]}

declare -f function_name; # declare a function

declare -x var=10; # declare an environment variable (export)

```
