# Control Flow

Back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Control Flow](#control-flow)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [Test operators](#test-operators)
  - [if statement](#if-statement)
    - [if else statement](#if-else-statement)
    - [if elif statement](#if-elif-statement)
    - [if elif else statement](#if-elif-else-statement)
  - [case statement](#case-statement)
  - [select statement](#select-statement)
  - [break statement](#break-statement)
  - [continue statement](#continue-statement)
  - [exit statement](#exit-statement)
  - [return statement](#return-statement)
  - [trap statement](#trap-statement)

## Test operators

The `test` command is used to evaluate expressions. It is used in the `if` statement to check conditions.

```bash

# string operators
[ string1 = string2 ] # equal
[ string1 != string2 ] # not equal
[ -z string ] # empty
[ -n string ] # not empty
[ string ] # not empty

# integer operators
[ int1 -eq int2 ] # equal
[ int1 -ne int2 ] # not equal
[ int1 -lt int2 ] # less than
[ int1 -le int2 ] # less than or equal
[ int1 -gt int2 ] # greater than
[ int1 -ge int2 ] # greater than or equal

# file operators
[ -f file ] # file exists and is a regular file
[ -d file ] # file exists and is a directory
[ -e file ] # file exists
[ -r file ] # file is readable
[ -w file ] # file is writable
[ -x file ] # file is executable
[ -s file ] # file is not empty
[ -z file ] # file is empty

# using parentheses instead of brackets
(( int1 < int2 )) # less than
(( int1 <= int2 )) # less than or equal
(( int1 > int2 )) # greater than
(( int1 >= int2 )) # greater than or equal
(( int1 == int2 )) # equal
(( int1 != int2 )) # not equal

```

## if statement

The `if` statement is used to execute a block of code if a condition is true. The condition is evaluated before the execution of the block of code.

```bash

if [ condition ]; then
    # code block
fi

# or

if 
    [ condition ]
then
    # code block
fi

```

### if else statement

The `if else` statement is used to execute a block of code if the condition is true and another block of code if the condition is false.

```bash

if [ condition ]; then
    # code block
else
    # code block
fi

```

### if elif statement

The `if elif` statement is used to execute a block of code if the condition is true and another block of code if the condition is false. It is used to check multiple conditions.

```bash

if [ condition ]; then
    # code block
elif [ condition ]; then
    # code block
fi

```

### if elif else statement

The `if elif else` statement is used to execute a block of code if the condition is true and another block of code if the condition is false. It is used to check multiple conditions.

```bash

if [ condition ]; then
    # code block
elif [ condition ]; then
    # code block
else
    # code block
fi

```

## case statement

The `case` statement is used to execute a block of code based on a pattern match. It is used to check multiple conditions.

```bash

# read from the user, prompt for input

read -p "Enter a value: " variable

case $variable in
    Yes|yes)|YES|y|Y) # multiple patterns
        # code block
        ;;
    [Nn][Oo]) # pattern match using globbing
        # code block
        ;;
    *)
        # default code block
        ;;
esac

```

## select statement

The `select` statement is used to create a menu for the user to select an option. It is used to create a menu.

```bash

select variable in option1 option2 option3;

do
    case $variable in
        option1)
            # code block
            ;;
        option2)
            # code block
            ;;
        option3)
            # code block
            ;;
        *)
            # default code block
            ;;
    esac
done

```

## break statement

The `break` statement is used to exit a loop. It is used to exit a loop early.

```bash

while [ condition ]; do
    # code block
    break
done

```

## continue statement

The `continue` statement is used to skip the current iteration of a loop. It is used to skip the current iteration of a loop.

```bash

while [ condition ]; do
    # code block
    continue
done

```

## exit statement

The `exit` statement is used to exit the shell. It is used to exit the shell.

```bash

exit

```

## return statement

The `return` statement is used to return a value from a function. The return value is stored in the `$?` variable or you can store it in a variable.

```bash

function myfunction {
    return 10
}

var=$(myfunction) # store the return value in a variable

```

## trap statement

The `trap` statement is used to catch signals and execute a block of code. It is used to catch signals.

```bash

trap "echo 'Caught signal'" SIGINT

```
