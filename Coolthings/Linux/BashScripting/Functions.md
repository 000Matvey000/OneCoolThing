# Functions

back to [Table of Contents](ToC.md)

## Table of Contents in this section

- [Functions](#functions)
  - [Table of Contents in this section](#table-of-contents-in-this-section)
  - [Function Declaration](#function-declaration)
  - [Function Call](#function-call)
  - [Function Arguments](#function-arguments)
  - [Function Return](#function-return)
  - [Function Return text](#function-return-text)
  - [Function Scope](#function-scope)
  - [Function Local Variables](#function-local-variables)
  - [Function Recursion](#function-recursion)

## Function Declaration

Functions are used to group code that performs a specific task. Functions are declared using the `function` keyword followed by the function name and a pair of curly braces `{}`. The code block that performs the task is placed inside the curly braces.

```bash

function myfunction {
    echo "Hello World"
}

```

## Function Call

Functions are called by their name followed by any arguments.

```bash

myfunction

```

## Function Arguments

Functions can accept arguments. The arguments are accessed inside the function using the `$1`, `$2`, `$3`, etc. variables.

```bash

function myfunction {
    echo "Hello $1"
}

myfunction "World";

```

## Function Return

Functions can return a value using the `return` statement. The return value is stored in the `$?` variable.

```bash

function myfunction {
    return 10
}

myvar=$(myfunction) # store the return value in a variable

echo $myvar

```

## Function Return text

Functions can return text using `echo`.

```bash

function myfunction {
    echo "Hello World"
}

myvar=$(myfunction) # store the return value in a variable

echo $myvar

```

## Function Scope

Variables declared inside a function are local to the function. They are not accessible outside the function.

```bash

function myfunction {
    local var=10
}

myfunction

echo $var # will not print anything

```

## Function Local Variables

The `local` keyword is used to declare a variable as local to the function. Local variables are not accessible outside the function.

```bash

function myfunction {
    local var=10
    typeset var2=20 # also makes the variable local
}

myfunction

echo $var # will not print anything

```

## Function Recursion

Functions can call themselves. This is called recursion.

```bash

function myfunction {
    echo "Hello World"
    myfunction
}

myfunction

```
