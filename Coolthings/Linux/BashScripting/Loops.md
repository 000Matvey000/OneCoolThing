# Loops

back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Loops](#loops)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [while loop](#while-loop)
    - [read command](#read-command)
    - [pipe into while loop](#pipe-into-while-loop)
  - [for loop](#for-loop)
    - [read from file](#read-from-file)
    - [file globbing](#file-globbing)
    - [loop through command output](#loop-through-command-output)
    - [seq command](#seq-command)

## while loop

The `while` loop is used to execute a block of code repeatedly as long as the condition is true. The condition is evaluated before the execution of the block of code.

```bash

count=0
while [ $count -lt 10 ]; do
    echo $count
    count=$((count+1))
done
# or
while 
    ((count < 10))
do # must be on a new line
    echo $count
    ((count++))
done

```

### read command

The `read` command reads a line from the standard input and assigns it to a variable. It is used to read input from the user.

```bash

# read from a file
# will read each line, each value on the line will be assigned to a variable,
while read a b c b c d e;
do
    echo "a: $a, b: $b, c: $c"
done < file.txt
```

### pipe into while loop

```bash

# pipe into while loop

cat file.txt | while 
read a b c;
do
    echo "a: $a, b: $b, c: $c"
done
```

## for loop

The `for` loop is used to iterate over a list of items. The list can be a list of strings or a list of numbers.

```bash

for i in 1 2 3 4 5; do
    echo $i
done

```

### read from file

```bash

for i in $(<file.txt); do # will loop each word in the file
    echo $i
done

```

### file globbing

```bash

for i in txt$; do # will loop each file ending with txt in the current directory
    echo $i
done

```

### loop through command output

```bash

for i in $(find . -type f -name "*.txt"); do # will loop each file ending with txt in the current directory
    echo $i
done

```

### seq command

The `seq` command is used to generate a sequence of numbers. It is useful in generating a list of numbers for the `for` loop.

```bash

for i in $(seq 1 5); do
    echo $i
done
# or    
for i in `seq 1 2 10`; do # you can use backticks to execute a command
    echo $i
done
# or brace expansion
for i in {1..5}; do
    echo $i
done

```
