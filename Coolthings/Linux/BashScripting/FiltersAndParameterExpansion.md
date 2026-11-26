# Using Filters and Parameter Expansion

Back to [Table of Contents](Toc.md)

## Table of Contents in this section

- [Using Filters and Parameter Expansion](#using-filters-and-parameter-expansion)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [Filters](#filters)
    - [wc - word count](#wc---word-count)
    - [head](#head)
    - [tail](#tail)
  - [sed](#sed)
    - [substitute](#substitute)
  - [awk](#awk)
  - [Parameters](#parameters)
    - [Positional Parameters](#positional-parameters)
    - [indirection](#indirection)
    - [brace operators](#brace-operators)

## Filters

### wc - word count

The `wc` command is used to count the number of lines, words, and characters in a file.

```bash

echo "Hello World" > myfile.txt

wc myfile.txt
wc -l myfile.txt # count lines
wc -w myfile.txt # count words
wc -c myfile.txt # count characters

```

### head

The `head` command is used to display the first few lines of a file.

```bash

head myfile.txt

head -n 2 myfile.txt # display the first 2 lines

```

### tail

The `tail` command is used to display the last few lines of a file.

```bash

tail myfile.txt

tail -n 2 myfile.txt # display the last 2 lines

tail -f myfile.txt # follow the file

```

## sed

The `sed` command is used to edit a file.

### substitute

The `s` command is used to substitute text.

`sed 's/old/new/' myfile.txt`

```bash

echo "Hello World" > myfile.txt

sed 's/Hello/Hi/' myfile.txt # replace first occurrence

sed 's/Hello/Hi/g' myfile.txt # replace all occurrences

# multiple substitutions

ls -la | while read a b c d e; do echo $a $b $c $d; done | sed -e 's/matvey/MATVEY/' -e 's/MATVEY/batvey/' # use -e to specify multiple sed commands

```

## awk

The `awk` command is used to process text files.

By default fields are separated by whitespace. Defined in the awk `FS` variable.

```bash

ps aux | awk '{print $1}' # print the first field

ps aux | awk '{print $1, $2}' # print the first and second fields

# print entire line

ps aux | awk '{print $0}'

# print the last field

ps aux | awk '{print $NF}'

# print the number of fields

ps aux | awk '{print NF}'

# print the number of lines

ps aux | awk 'END {print NR}'

# print the sum of the first field

ps aux | awk '{sum += $1} END {print sum}'

# print the average of the first field

ps aux | awk '{sum += $1} END {print sum/NR}'

# print the sum of the first field and the average of the first field

ps aux | awk '{sum += $1} END {print sum, sum/NR}'

# print the sum of the first field and the average of the first field with a label

ps aux | awk '{sum += $1} END {print "Sum:", sum, "Average:", sum/NR}'

```

## Parameters

### Positional Parameters

Positional parameters are variables that store arguments passed to a script or function.

The `shift` command is used to shift the positional parameters to the left. eg. `$1` becomes `$2`, `$2` becomes `$3`, etc.

```bash

#!/bin/bash

echo $0 # script name

echo $1 # first argument
echo $2 # second argument
echo $3 # third argument
echo $4 # fourth argument
echo $5 # fifth argument
echo $6 # sixth argument
echo $7 # seventh argument
echo $8 # eighth argument
echo $9 # ninth argument
echo ${10} # tenth argument, use braces for arguments greater than 9
echo $# # number of arguments
echo $@ # all arguments, as separate strings
echo $* # all arguments, as a single string

shift # shift arguments to the left

```

### indirection

Indirection is used to reference a variable indirectly.

```bash

#!/bin/bash

var=10
ref=var

echo ${!ref} # prints 10

```

### brace operators

Can be used to replace null values.

```bash

#!/bin/bash

echo ${var:-10} # prints 10 if var is null, does not assign 10 to var

echo ${var:=10} # prints 10 if var is null and assigns 10 to var

echo ${var:?} # prints an error message if var is null

echo ${var:+10} # prints 10 if var is not null, otherwise prints null

echo ${var:0:2} # prints the first 2 characters of var

echo ${var:2} # prints all characters of var starting from the third character

echo ${#var} # prints the length of var

echo ${var#prefix} # removes prefix from var

echo ${var%suffix} # removes suffix from var

```