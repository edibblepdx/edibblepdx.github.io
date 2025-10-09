---
title: A Language Analysis of Lua
date: June 22, 2025
edited: Oct 9, 2025
summary: >
    An analysis of Lua as it relates to some general principles of programming languages.
---

# Abstract

In this article, I discuss language features of Lua as they relate to some general principles of programming languages. I will, in places, use some more complex features of Lua such as the debug library (though Lua provides no actual debugger), metamethods, and coroutines as they are relevant to other uses of the language, but I will not spend extensive time explaining such topics. I also will not cover the C-API.
\
\
The primary sources for this article are the book Programming in Lua 4th edition (which concerns Lua 5.3.2), the Lua mailing list archive, the Lua 5.4 manual, and tested in Lua 5.4.7. As such, I will talk about features guaranteed compatible with Lua 5.4.7. More than likely, most of what is written here will also be 5.3, 5.2, and LuaJIT compatible, but I will be using the PUC compiler. If I don't associate a version with a statement it is safe to assume Lua 5.4.7. And any code examples given with `>` preceding will be using the REPL environment. My solutions to most of the Programming in Lua book exercises and some code examples from the book can be found in this [github repo](https://github.com/edibblepdx/pil-4th). But please, buy the book if you would like to learn more.

<img src="https://i.ibb.co/hJLNn2Yy/Lua-Sprite.png" alt="Lua-Sprite" border="0"/>

&nbsp;
# Why Lua?

Lua is intended as an embedded language, designed to be integrated into
software implemented in C/C++ and other conventional languages. It has also
been used to extend Java, C#, Fortran, and even other scripting languages.
Lua is used anywhere where a simple, extensible, and portable scripting
language can be useful such as embedded systems, mobile devices, the
internet, and games. Lua is one of the most popular scripting languages
for game development [natively](https://www.satori.org/2009/03/05/the-engine-survey-general-results/)
and in the [web](https://gamedevjs.com/survey/2024/#q14). It is the most
popular language supporting videogame modding api's. Lua also exists
as a <em>glue language</em>, connecting existing high-level components
written in statically typed, compiled languages that take the bulk of
the CPU time and are unlikely to change during program development. Furthermore,
\
\
**Lua is simple.**
\
\
The Lua 5.3 Linux 64-bit executables including standard libraries is 220 KB according to the book. On my machine, the Lua 5.4.7 Linux 64-bit executable including standard libraries is 300 KB and `luac`, which compiles Lua scripts to bytecode for later execution, is 218 KB.
\
\
Lua has 22 keywords and 33 other tokens. Lua 5.3 added bitwise operators and floor division with integers (although modulus was already defined with such behavior). Lua does everything with tables (I mean everything). Tables are like associative arrays. They are neither values nor variables; they are <em>objects</em> dynamically-allocated. As such Lua can only have references or pointers to a table. Lua is also one-indexed which is claimed to be a more natural representation.
\
\
**Lua is portable.**
\
\
Lua can run on all flavors of Unix, Windows, IOS, OS X, IBM mainframes, game consoles, microcontrollers, etx. Lua does not perform conditional compilation and is written in IOS (ANSI) C. That is, if you have a C compiler you can compile Lua.
\
\
**Lua is extensible.**
\
\
Lua implements most of it's own functionality through external libraries. It is easily extensible through it's C api and can interface with external languages like C/C++, Java, C#, and Python. Lua is often used as a tool for developing domain specific languages. [Luarocks](https://luarocks.org/) is the package manager for Lua modules.
\
\
**Lua is efficient.**
\
\
Lua is one of the fastest languages in the realm of scripting languages. And LuaJIT is one of the fastest just-in-time compilers.

&nbsp;
# Implementations

Lua is designed, implemented, and maintained by Roberto Ierusalimschy, Waldemar Celes, and Luiz Henrique de Figueiredo at PUC-Rio University in Brazil since 1993. But Lua is meant to be forked and many other versions of the language exist.
\
\
It is possibly easiest to split Lua along the PUC compiler and the JIT compiler. Lua releases maintain some backwards compatibility but each new version is somewhat comparable to the difference between Python2 and Python3. As such, many use cases may target Lua 5.1 for the widest compatibility and access to the JIT compiler. This is Neovim's approach for example.
\
\
PUC Lua is the standard rolling release of Lua maintained by the team at PUC-Rio University. LuaJIT is solely maintained by Mike Pall since 2005 offering a just-in-time compiler for the language. It is mostly "feature complete" and offers full upwards compatibility to Lua 5.1 with optional support for some Lua 5.2 and 5.3 features. Since LuaJIT 2.1, both PUC Lua and LuaIT are on rolling releases. LuaJIT's FFI library is significantly faster and easier to use than Lua's C-API. Where performance is critical, LuaJIT may be preferred; the game framework Love2D uses LuaJIT, but the handheld system Playdate uses Lua 5.4. A quick example of some features missing in LuaJit are the `_ENV` table and ephemeron tables.

```lua
-- determine whether Lua actually implements ephemeron tables

local factory; do
  local mem = {}                      -- memorizing table
  setmetatable(mem, { __mode = "k" }) -- weak keys
  function factory(o)
    local res = mem[o]
    if not res then
    res = (function() return o end)
    mem[o] = res
    end
    return res
  end
end

-- o is a strong reference to k; it is maintained in a
-- closure of the function 'factory'. Each key in the
-- table 'mem' thus has a strong reference to itself in
-- the associated table value.

-- now to test if lua implements ephemeron tables
local a = {}
setmetatable(a, { __gc = function() print("I am being collected") end })
factory(a)
a = nil

collectgarbage()
--> (Lua 5.4.7) I am being collected
--> (Luajit) (nothing)
```

Other versions of Lua are Luau, which is developed and maintained by Roblox since 2005. It is based on Lua 5.2. World of Warcraft and Garry's Mod both use forks Lua 5.1. Factorio uses Lua 5.2.1. Adobe Lightroom uses it's own fork of Lua. And there are many more.

&nbsp;
# Documentation

The authoritative Lua documentation is the [Lua Reference Manual](https://www.lua.org/manual/). Additionally, the [Programming in Lua](https://www.lua.org/pil/) book is freely available online up to the third edition. The fourth edition describes Lua 5.3 and is available for purchase. If at any point the book disagrees with the reference manual, always trust the reference manual. There is also the [Lua-Users](http://lua-users.org/) site which is independent of the Lua language maintainers and has an archive of the Lua mailing list. The PUC team only owns the lua-users domain and determines where it points to. For forks of Lua, see their documentation.
\
\
Lua is not officially standardized by any formal industry group or government. And there is no external standards body that defines Lua apart from the Lua authors themselves at PUC-Rio University, Brazil. The Lua reference manual serves in place of a standard and the reference implementation is in ANSI C. There are many existing forks of Lua that may not be compatible with each other.
\
\
The official formal grammar of Lua is available in the Lua reference manual in extended BNF. [The Complete Syntax of Lua](https://www.lua.org/manual/5.4/manual.html#9).

&nbsp;
# Compilation

Lua is an interpreted language, but its execution model includes a compilation step to bytecode intermediate representation which is run in the Lua virtual machine. You can also precompile a <em>binary chunk</em> with `luac` to be executed later. The function `loadfile` will compile a chunk and return it as a function. The function `dofile` is an auxiliary function that compiles a chunk then runs it.

&nbsp;
# Primitive Types and Expressions

Lua is dynamically typed. This means that variables do not have types; only values do. There are eight basic types in Lua: nil, boolean, number, string, function, userdata, thread, and table. The userdata type allows arbitrary C data to be stored in Lua variables; they can only be created and manipulated through the C API. Threads represent independent threads of execution and are used to implement coroutines. Tables are the sole data structure in Lua, implemented as heterogeneous associative arrays. Tables can implement sets, records, graphs, trees, etc. Tables may also contain methods and provide the object oriented styles of programming.

&nbsp;
## Numbers

Since Lua 5.3 there are two types of numbers: 64-bit integer numbers and double-precision floating-point numbers. Prior to Lua 5.3 floats were the only numeric type. You can compile Lua as <em>Small Lua</em> with the macro `LUA_32BITS` defined. Small Lua is identical to Standard Lua except integers are 32-bit and floats are single-precision. LuaJIT has a different implementation of integers.
\
\
The maximum integer is `2^63-1` and you can receive the value of integer limits through the math library with `math.maxinteger` and `math.mininteger`. In Lua 5.2 the maximum integer representation is `2^53` and there is no math constant since 5.2 doesn't actually have integers. The maximum floating point number is `2^53`.
\
\
Lua will convert a float to an integer if you OR `|` it with zero, but only if it has no fractional part and is within integer range.

```lua
> 2^53 | 0 --> 9007199254740992 
> 3.2  | 0 --> number has no integer representation
> 2^64 | 0 --> number has no integer representation 
```

&nbsp;
## Arithmetic Operations

Arithmetic operations in lua <em>wrap around</em> according to the rules of two-complement arithmetic.

```lua
> math.maxinteger + 1 == math.mininteger   --> true
> math.mininteger - 1 == math.maxinteger   --> true
> -math.mininteger == math.mininteger      --> true
> math.mininteger // -1 == math.mininteger --> true
```

Dividing a non-zero number by zero gives `inf` which can also be retrieved by `math.huge`. Dividing zero by zero gives `nan`. Floor division by zero results in an error. 

```lua
> 1 / 0  --> inf
> -1 / 0 --> -inf
> 0 / 0  --> -nan
> 1 // 0 --> attempt to divide by zero
```

`math.huge` is defined to be larger than any other number. `1e309` and larger is equivalent to `inf`.

```lua
> 1e308                 --> 1e+308
> 1e309                 --> inf 
> 1e308 < 1 / 0         --> true
> 1e308 < math.huge     --> true
> math.huge > math.huge --> false
```

`nan` is the only value that does not equal itself, unless you are comparing `math.nan` with itself.

```lua
> x = 0 / 0
> x == x               --> false
> x ~= x               --> true
> math.nan == math.nan --> true
```

&nbsp;
## Booleans

All values are truthful and thus evaluate to `true` except only for `false` and `nil` which evaluate to `false`.

&nbsp;
## Logical Operations

The logical operators in Lua are `and`, `or`, and `not`. Binary logical operators `and` and `or` evaluate to one of their operands based on their truth value. This allows for conditional assignment which you may have seen in Python or JavaScript code. This also implements the ternary operator that you may see in C code.

```lua
> nil or 42  --> 42
> nil and 42 --> nil
> 42 or 11   --> 42
> 42 and 11  --> 11

> false and 11 or 42 --> 42
```

The unary logical operator `not` is negation. It will convert non-booleans into booleans. The useful idiom is `not not` to retrieve the true value of a non-boolean type.

```lua
> not not 42 --> true
```

&nbsp;
## Strings

Strings in Lua are enclosed in single quotes `'` or double quotes `"`. You can concatenate strings with the `..` operator. Strings may contain any 8-bit character, including embedded zeros ('\0'). And Lua 5.3 added UTF-8 escape sequences `\u{XXX}`. Lua also includes a small utf8 library for string manipulation.

```lua
> a = "Hello"
> a .. " World" --> Hello World
> a             --> Hello
```

Long strings are enclosed in double square brackets with any number of matching equal signs between brackets.

```lua
a = [==[
a long string
on multiple lines
]==]
```

Numbers are coerced into strings.

```lua
print(10 .. 10) --> 1010
```

And arithmetic on strings converts them to a number.

```lua
> "10" + 3 --> 13
```

String manipulation is performed with the string library.

```lua
> string.rep("abc", 3)         --> abcabcabc
> string.reverse("abc")        --> cba
> string.lower("ABC")          --> abc
> string.upper("abc")          --> ABC
> string.gsub("abc", "b", " ") --> a b
-- and others --
```

Strings cannot be indexed. To get a substring use `string.sub`.

```lua
> s = "[in brackets]"
> string.sub(s, 2, -2)  --> in brackets
> string.sub(s, 1, 1)   --> [
> string.sub(s, -1, -1) --> ]
```

&nbsp;
# Operators

Lua has the following operators, ordered by precedence in the table below from higher to the lower priority:

```lua
^
unary operators (- # ~ not)
*    /    //    %
+    -
..         (concatenation)
<<   >>    (bitwise shifts)
&          (bitwise AND)
~          (bitwise exclusive OR)
|          (bitwise OR)
<    >    <=    >=    ~=    ==
and
or
```

Concatenation `..` and exponentiation `^` are right associative. All other binary operators are left associative.

&nbsp;
# Variable Bindings and Scope

There are three kinda of variables in Lua: global variables, local variables, and table fields. All variable bindings are global unless you tag them as `local`. Unlike global variables, a local variable has it's scope limited to the block where it is declared. A block can be the body of a control structure, a function, or a chunk (the file).
\
\
You cannot use variable bindings in expressions like with `let` bindings in languages like Haskell. The following is invalid syntax.

```lua
print(local a = 5; a) --> has no meaning
```

Every Lua program is compiled in the scope of an external local variable `_ENV` (so that `_ENV` itself is never a free name in a chunk). Every reference to a free name `var` is syntactically translated to `_ENV.var`. `_ENV` is a completely regular and local name. As such, you can define new variables and parameters with that name. Each reference to a free name will use the `_ENV` table that is visible at that point in the program. Any table with the name `_ENV` is known as the *environment*.
\
\
Lua keeps a *global environment* at a special index in the C-registry. The global table `_G` is initialized to this value and so is `_ENV`. However, Lua never uses `_G` internally. Therefore, by default, free names in Lua code refer to entries in the global environment and are *global variables*.
\
\
Lua is **lexically scoped**. The scope of a local variable begins after the declaration and goes until the last non-void statement at end of the innermost block containing the declaration. Because of lexical scoping rules, local variables can be freely accessed by functions defined in their scope.

&nbsp;
# Functions

Functions in Lua are first class values. A program can store functions in variables (both global and local) and in tables, pass functions as arguments to other functions, and return functions as results. Functions also have proper lexical scoping meaning that they can access variables of their enclosing scope within a closure (and that Lua properly contains the lambda calculus).
\
\
Functions in Lua are defined in `function` .. `end` blocks as shown in the following example. In fact, function declaration is syntactic sugar for assigning a variable a value of type function.

```lua
function a() end
a = function() end -- is equivalent

local function b() end
local b = function() end -- is equivalent
```

&nbsp;
## Arguments

All arguments in Lua are passed by value. But functions, tables, userdata, and threads are objects and variables do not contain these values, only references to them. Assignment, parameter passing, and function returns manipulate references to these values and do not imply a copy of the object itself. Lua will also attempt to eagerly evaluate arguments. Note that the default value of a variable is `nil`. And the default value of a missing table entry is `nil`—the environment itself is a table.

```lua
function a(x) return 42 end

a(b)     --> 42
a(b + c) --> attempt to perform arithmetic on a nil value (global 'b')

function a(t) t.x = 42 end
t = {}; a(t)
print(t.x) --> 42
```

Lua supports proper tail calls. If the last thing a function does is call another function (or itself), it takes no additional stack space; i.e. a stack overflow error is impossible.

```lua
function f()
  return g()
end
```

&nbsp;
## Recursion

But this next example can overflow can overflow because the function `f` still has to discard the return value of `g`.

```lua
function f()
  g()
  return -- this return is implicit
end
```

Lua also supports mutually recursive functions. And this will never overflow making it useful for state machines.

```lua
local a, b -- forward declaration only required if a and b are local

a = function()
  return b()
end

b = function()
  return a()
end

a()
```

&nbsp;
## Nesting

Functions in Lua can be nested using the same syntax as before.

```lua
function outer()
  function inner()
    print("hello inner")
  end

  inner()
end

print(outer()) --> "hello inner"
```

Additionally, since `inner` was declared global, once `outer` gets called `inner` is put into the global environment.

```lua
-- snip --
print(outer()) --> "hello inner"
print(inner()) --> "hello inner"
```

More abstractly, since are variable declarations are by default global, functions can declare global variables.

```lua
local function setGlobal(v)
  a = v
end

setGlobal(42)
print(a) --> 42

local function setLocal(v)
  local b = v
end

setLocal(42)
print(b) --> nil
```

&nbsp;
## First-Class Values

Functions are first class values in Lua and there are no restrictions on having functions as arguments, as return values, or in regular assignment. They can be named or anonymous and closed over variables. And they will be collected by the garbage collector at the end of their lifetime.
\
\
You can pass a function as an argument to another function.

```lua
function on10(f) return f(10) end

print(on10(function(x) return x + 32 end)) --> 42
```

Here is an example of an iterator over subsets that takes a table and a function as arguments.

```lua
-- write a 'true iterator' that traverses
-- all subsets of a given set

-- 2^n subsets including the empty set
-- can use a binary representation
--> either it is in the subset or it is not
--> iterate from 0 to n_subsets - 1
--> each binary digit is in or out

function allsubsets (t, f)
  local n = #t
  local n_subsets = 2^n
  local subset = {}
  for i = 0, n_subsets - 1 do
    for j = 1, n do
      local include = i >> (n - j) & 1
      if include == 1 then
        subset[#subset + 1] = t[j]
      end
    end
    f(subset)
    subset = {}
  end
end

local a = {}
-- just going to collect the subsets 
allsubsets({1, 2, 3, 4, 5}, function (t) a[#a + 1] = t end)
for k, v in ipairs(a) do 
  io.write("{")
  for j, k in ipairs(v) do 
    io.write(string.format("%d,",k))
  end 
  io.write("}\n")
end
print(string.format("subsets: %d", #a))
```

Functions can return other functions as a generator.

```lua
function newCounter()
  local count = 0
  return function()
    count = count + 1
    return count
  end
end

c1 = newCounter()
print(c1()) --> 1
print(c1()) --> 2

c2 = newCounter()
print(c2()) --> 1
```

&nbsp;
## Storing Functions

Since functions are first-class values in Lua, they can be assigned as elements in tables, used as callbacks, and stored as instance methods. In the following example, both `proxy` and `mt` are tables.

```lua
-- write a function fileAsArray that returns a proxy to a file
-- after t = fileAsArray("filename")
-- t[i] returns the i-th byte in the file
-- an assignment to t[i] updates the i-th byte in the file

function fileAsArray (filename)
  local file = assert(io.open(filename, "r+"))
  local proxy = {
    close = function ()
      if file then file:close() end
    end
  }

  mt = {
    __index = function (_, k)
      file:seek("set", k - 1)
      return file:read(1)
    end,

    __newindex = function (_, k, v)
      file:seek("set", k - 1)
      file:write(string.char(v))
    end,

    __pairs = function ()
      file:seek("set")
      local k = 0
      return function ()
        k, v = k+1, file:read(1) or nil
        return v and k, v
      end
    end,

    __len = function ()
      return file:seek("end")
    end
  }

  setmetatable(proxy, mt)
  return proxy
end

t = fileAsArray("20-4-file")

t[1] = 67
t[2] = 65
t[3] = 84

print()
print(t[1]) --> C
print(t[2]) --> A
print(t[3]) --> T

print()
print(#t)

print()
for k, v in pairs(t) do print(k, v) end

t.close()
```

&nbsp;
# Atomic Statements

The smallest atomic statements (i.e. statements that do not have
sub-statements) in Lua are the following,

```
atom_stat ::=  ‘;’ |
    varlist ‘=’ explist |
    functioncall |
    label |
    break |
    goto Name |
    local attnamelist [‘=’ explist]
```

Expressions cannot be used as atomic statements in Lua. You will get an "unexpected symbol" or "attempt to call a nil value" error if you try to use an expression as a statement. Neither can Assignment be performed as a side-effect of evaluating an expression in Lua.

<!-- might want to make a section on side ffects or find a better place for the second part -->

&nbsp;
# Structured Control Statements

&nbsp;
## Sequencing

The unit of execution in Lua is called a chunk. A chunk is defined as a sequence of statements, where each statement may optionally be followed by a semicolon: `chunk := {stmt [;]}`. A block is a list of statements and is syntactically equivalent to a chunk. A block may be explicitly delimited to produce a single statement: `stmt := do block end`. A chunk may be stored in a file or a string inside the host program. Lua compiles a chunk as an anonymous function with the global environment set as the first upvalue in the name local name `_ENV`; each Lua program is a function.

&nbsp;
## Selection

All control structures have an explicit terminator: end terminates the if, for and while structures; and until terminates the repeat structure. The condition expression of a control structure can result in any value. Recall that Lua treats all values as true except for `false` and `nil`.
\
\
Lua has `if` statements:

```lua
local op = "add"
if op == "add" then
  print(1 + 2)
elseif op == "mul" then
  print(1 * 2)
else
  print("no op")
end
```

Lua has no match statement, but does support dynamic dispatch with tables (the outer parens are necessary to form an expression):

```lua
local function dynDispatch(op)
  return ({
    ["add"] = function(a, b) return a + b end,
    ["mul"] = function(a, b) return a * b end,
    ["sub"] = function(a, b) return a - b end,
    ["div"] = function(a, b) return a / b end,
  })[op](1, 2)
end

print(dynDispatch "add") --> 3
```

Or a slightly more interesting example:

```lua
local function dynDispatch(op, ...)
  return ({
    ["add"] = function(...)
      local s = 0
      for _, v in ipairs { ... } do
        s = s + v
      end
      return s
    end,
    ["mul"] = function(...)
      local s = 1
      for _, v in ipairs { ... } do
        s = s * v
      end
      return s
    end,
  })[op](...)
end

print(dynDispatch("mul", 1, 2, 3, 4, 5)) --> 120
```

Logical operators also evaluate to one of their operands. The idiom `x = x or v` is equivalent to `if not x then x = v end`. And the idiom `a and b or c` is equivalent to the ternary operator in C.

```lua
> true and 1 or 2  --> 1
> false and 1 or 2 --> 2
```

&nbsp;
## Iteration

Lua has `while`, `repeat`, and `for` control structures related to iteration. `while` repeats its body *while* a condition is true. `repeat` repeats its body *until* a condition is true and will always execute the body at least once.

```lua
while true do
  print "forever"
end

repeat
  print "forever"
until false
```

Lua has two `for` constructs: the *numeric for* and the *generic for*. The generic for concerns iterators so that will be covered in the next section. Loop variables are local to the loop body and modifying them can result in unpredictable behavior. The numeric for has the following syntax:

```lua
for var = exp1, exp2, exp3 do
  --something
end
```

Where the loop will be executed for each value of `var` from `exp1` to `exp2` with an optional step size in `exp3`. The loop will stop after reaching `exp2`, not before. Meaning that the following loop executes 5 times:

```lua
for _ = 1, 5 do end
```

And this executes indefinitely:

```lua
for _ = 1, math.huge do end
```

&nbsp;
# Iterators

Naively, iterators can be implemented using closures. In practice, this involves two functions: the closure itself and a factory.

```lua
function values(t)
  local i = 0
  return function () i = i + 1; return t[i] end
end
```

Now when we call an iterator returned from the factory, we receive the next value in the sequence. It's simplest to use the generic `for`.

```lua
for elements in values(t) do
  print(element)
end
```

The syntax for the generic `for` is

```lua
for var-list in exp-list do
  body
end
```

The generic `for` first evaluates the expressions after the `in`. These should evaluate to three values maintained by the `for`: the iterator function, invariant state, and the initial value for the control variable (missing values are `nil`). The `for` then calls the iterator with two arguments: the invariant state, and the control variable. If the first return value from the iterator is `nil` (the control variable), the loop terminates. Otherwise, the `for` executes its body and calls the iteration function again.
\
\
Stateless iterators (as their name implies) maintain no state. Therefore we can save the cost of creating new closures and use the same stateless iterator in multiple loops. A stateless iterator generates the next element for the iteration using only the invariant state and the control variable passed to it by the `for`.
\
\
Here is an iterator `fromto` that is equivalent to a numeric for and a stateless version. This is exercise 18-2 from Programming in Lua 4th edition.

```lua
-- exercise 18-2
-- add a step parameter to exercise 18-1
-- if you want to support counting down
-- could have 2 different functions you possibly return
--
-- could probably figure out a better way, but I want
-- as few operations withing the iterator as possible
-- and this is what I thought of.

function fromto(n, m, s)
  s = math.abs(s)   -- s should be positive
  -- just going to handle 0 step this way and the for does nothing
  if s == 0 then return function() return nil end end
  -- counting up
  if (n <= m) then
    n, m = n - s, m - s + 1
    return function()
      n = (n < m) and (n + s) or nil
      return n
    end
    -- counting down
  else
    n, m = n + s, m + s - 1
    return function()
      n = (n > m) and (n - s) or nil
      return n
    end
  end
end

print()      -- spacing
for i in fromto(1, 38, 9) do
  print(i)   --> 1 10 19 28 37
end

print()      -- spacing
for i in fromto(38, 1, 9) do
  print(i)   --> 38 29 20 11 2
end

-- stateless version
-- iter is the iterator function
-- the table {max, s} is the invariant state
-- n-s is the control variable initial value
--
-- this doesn't include the extra checks from the other version
-- could make a local table of iterator functions if you wanted
local function iter(t, i)
  return (i < t.max) and (i + t.s) or nil
end

function fromtoagain(n, m, s)
  s = math.abs(s)   -- s should be positive
  return iter, { max = m - s + 1, s = s }, n - s
end

print() -- spacing
for i in fromtoagain(1, 9, 2) do
  print(i)
end

-- We can use the stateless version again in other loops
-- without the cost of making new closures. The iterator
-- maintains no state, it only uses its arguments to
-- return a value.
```

You may have noticed that our iterators so far have not had any loops. The `for` was really the one handling the iteration. True iterators were popular in older versions of Lua before we had the generic `for`. True iterators take some collection and loop over it in their body. This allows for the use of `goto` and `break` statements inside the iterator body.

Here is a true iterator over subsets implemented in exercise 18-5 from Programming in Lua 4th edition.

```lua
-- write a 'true iterator' that traverses
-- all subsets of a given set

-- 2^n subsets including the empty set
-- can use a binary representation
--> either it is in the subset or it is not
--> iterate from 0 to n_subsets - 1
--> each binary digit is in or out

function allsubsets(t, f)
  local n = #t
  local n_subsets = 2 ^ n
  local subset = {}
  for i = 0, n_subsets - 1 do
    for j = 1, n do
      local include = i >> (n - j) & 1
      if include == 1 then
        subset[#subset + 1] = t[j]
      end
    end
    f(subset)
    subset = {}
  end
end

local a = {}
-- just going to collect the subsets
allsubsets({ 1, 2, 3, 4, 5 }, function(t) a[#a + 1] = t end)
for k, v in ipairs(a) do
  io.write("{")
  for j, k in ipairs(v) do
    io.write(string.format("%d,", k))
  end
  io.write("}\n")
end
print(string.format("subsets: %d", #a))
```

Coroutines provide another method of iteration. A coroutine is a line of execution that suspends its execution only when it explicitly requests to be suspended—they redefine the relationship between caller and callee. Coroutines have their own stack, local variables, and own instruction pointer; they share global variables and pretty much anything else. The idea is to pair a generator with a factory that arranges the generator to run inside a coroutine and creates the iterator function.

```lua
-- 24.2 transform exercise 6.5 into a generator for combinations using coroutines
--[[
  for c in combinations({"a", "b", "c"}, 2) do
    printResult(c)
  end
--]]


--[[
  Generate all combinations in a of size m.
  a:  table
  n:  number (size of a)
  m:  number (size of combination)
  cn: table  (combination)
--]]
local function combingen(a, n, m, cn)
  cn = cn or {} -- combination

  --[[
    If m <= 0 then you have the empty combination.
    In other words, you have exhausted all elements in a.

    If m > n then you have no possible combination in a.

    To avoid unpacking a table each time you could instead
    add another parameter for the start of the sub-array.
  --]]

  if m <= 0 then
    -- no more combinations?
    coroutine.yield(cn)
  elseif m <= n then
    local tail = { table.unpack(a, 2) }

    cn[#cn + 1] = a[1]                -- add the first element
    combingen(tail, n - 1, m - 1, cn) -- generate C(n-1,m-1) combinations of remaining elements

    cn[#cn] = nil                     -- remove the first element
    combingen(tail, n - 1, m, cn)     -- generate C(n-1,m) combinations of remaining elements
  end
end

local function combinations(a, m)
  return coroutine.wrap(function() combingen(a, #a, m) end)
end

local function printResult(a)
  for i = 1, #a do io.write(a[i], " ") end
  io.write("\n")
end

for c in combinations({ "a", "b", "c" }, 2) do
  printResult(c)
end; print()
--> a b
--> a c
--> b c

for c in combinations({ 1, 2, 3, 4, 5 }, 3) do
  printResult(c)
end
```

&nbsp;
# goto, break, and return

Lua has `break`, `return`, and `goto` statements. `break` and `return` allow jumping out of a block and `goto` allows jumping to almost any point in a function. `break` terminates an inner loop (`for`, `repeat`, or `while`). A `return` statement returns values from a function. There is an implicit return at the end of every function. A `return` statement can only occur at the end of a block (or chunk).

```lua
function a()
  if true then return end -- ok
  return -- not ok
  do return end -- ok
  return -- ok
end

return -- ok
```

`goto` jumps execution to a corresponding label. The label syntax is `::label::`. Labels follow normal visibility rules and `goto` cannot jump into a block, neither can they jump into a function, nor can they jump into the scope of a local variable. `goto` can be used to simulate continue or redo constructions and more.

```lua
while some_condition do
  ::redo::
  if other_condition then goto continue end
  if yet_another_condition then goto redo end
  ::continue::
end
```

&nbsp;
# Errors

Any unexpected condition that Lua encounters will raise an error. Errors can also be explicitly raised with the function `error` which takes an error message as its first argument. The second argument to `error` is the level, with 1 being the current scope and 2 being the caller. Lua also has an `assert` function that asserts its first argument is not false. The second argument to `assert` is an optional error message.
\
\
To handle errors inside Lua code we use `pcall` or "protected call" and encapsulate the code in a function. If no errors are found it will return `true` and any other values returned by the encapsulated code. Otherwise, it returns `false` and the error message. `pcall` itself never raises an error.

```lua
local ok, msg = pcall(function()
  -- some code
  if unexpected_condition then error() end
  -- some code
end)

if ok then
  -- regular code
else
  -- error handling code
end
```

`pcall` destroys part of the stack when it encounters an error. Consequently, if we want a traceback we would rather use `xpcall`, which takes a *message handler function* as its second argument that can create a stack trace before unwinding. Tracebacks are provided by the debug library through the function `debug.traceback` which returns a (potentially long) string containing the traceback.

```lua
local function f()
  return 1 + nil
end

local function handler(err)
  return debug.traceback("Error: " .. tostring(err), 2)
end

local ok, msg = xpcall(f, handler)

if not ok then
  print(msg)
end
--> Error: test.lua:2: attempt to perform arithmetic on a nil value
--> stack traceback:
-->     test.lua:2: in function <test.lua:1>
-->     [C]: in function 'xpcall'
-->     test.lua:9: in main chunk
-->     [C]: in ?
```

When a coroutine raises an error, it does not unwind its stack. This means that we can inspect it after an error. The traceback does not go through the call to `resume` since the coroutine and the main program run in different stacks.

```lua
local function f() error() end
local co = coroutine.create(f)
print(coroutine.resume(co)) --> false nil
print(debug.traceback(co))
--> stack traceback:
-->     [C]: in function 'error'
-->     test.lua:2: in function <test.lua:1>
```

&nbsp;
# Product Types

Lua supports heterogeneous, mutable, boxed product types using tables, which can act as tuples and records. Tables are boxed as variables in Lua only hold references to objects. Tables are heterogeneous: they hold any value and can be indexed by any value (`boolean`, `number`, `string`, `userdata`, `function`, `thread`, and `table`) with the exception that table keys cannot be `nil` and that a table value of `nil` is marked for garbage collection. Indices may also be computed at runtime as tables are implemented as associative arrays.

```lua
-- tuple
{ "Alice", 28, "accounting" }

-- record
{
  ["name"] = "Alice",
  ["age"] = 28,
  ["department"] = "accounting"
}

-- equivalent record syntax but less general
-- (i.e. keys in this form must be valid identifiers)
{
  name = "Alice",
  age = 28,
  department = "accounting"
}
```

You can also use semicolons instead of commas which is inherited from older versions of Lua, however seldom used.

&nbsp;
# Sum types

There is no explicit support for sum types in Lua. But since Lua is also dynamically typed we can use tagged tables to somewhat mimic the behavior of a sum type.

```lua
local b = { t = "string", v = "hello" }
local c = { t = "number", v = 42 }
local sum_type = {
  ["string"] = function(v) io.write("I am a string: ", v, "\n") end,
  ["number"] = function(v) io.write("I am a number: ", v, "\n") end,
}
sum_type[b.t](b.v) --> I am a string: hello
sum_type[c.t](c.v) --> I am a number: 42
```

`nil` can be seen as a built in sum type with any other value. The common idiom in Lua

```lua
local a = a or b
```

Checks for the existence of a global 'a' and assigns the local 'a' that value if it exists or 'b'. This may be used to bring a global value into local scope which provides faster access to said value simply as a result of Lua's implementation. In general, variable accesses are expanded to `_ENV.name` and since `_ENV` is a table (that you may modify or replace as you please) accessing an absent field returns `nil`. So that if you don't care for a default value you can simply perform direct assignment and the local 'a' will receive that value or `nil`.

&nbsp;
# Array and Dictionary Types

Array and dictionary types are implemented through Lua tables. Tables are heterogeneous collections implemented as associative arrays. They can hold any value and be indexed by any value, with the exception of `nil`. More precisely, a table value of `nil` is marked for garbage collection. It may be important to know that float indices are converted to integers if they have no fractional part. The environment itself is a table.
\
\
To represent **arrays** or **lists** in Lua we use a table with integer keys. There is neither a way nor need to declare the size, simply initialize the elements we need:

```lua
list = {"Alice", 28, "accounting"}
-- is equivalent to
list = {[1] = "Alice", [2] = 28, [3] = "accounting"}
```

To store the size of the array or list, it is convention to use an index labeled 'n'. However, recall that uninitialized elements are `nil` such that sequences are terminated; a sequence is defined as a set with indices from 1..n with no holes. Lua provides an operator `#` that will return the length of said sequence. A table with no numeric keys is a sequence with length zero.
\
\
Sequences can be resized and the length operator provides a simple syntax.

```lua
list = {"Alice", 28, "accounting"}
list[#list + 1] = "Oregon"
--> {"Alice", 28, "accounting", "Oregon"}
list[#list] = nil
--> {"Alice", 28, "accounting", nil}
--> list[4] now terminates the sequence and will be collected
```

Lua also has a table library for operating over lists and sequences. It could be called the sequence or list library but the original name is maintained. It provides operations such as inserting, removing, or moving values within sequences.

```lua
list = {"Alice", 28, "accounting"}
table.insert(list, "Oregon")
--> {"Alice", 28, "accounting", "Oregon"}
table.remove(list)
--> {"Alice", 28, "accounting", nil}
table.move(list, 2, #list, 1)
list[#list] = nil
--> {28, "accounting", nil, nil}
```

You may also insert or remove from the front, moving all other elements.
\
\
To represent **dictionaries** in Lua we use a table with named keys. There is neither a way nor need to declare the size, simply initialize the elements we need:

```lua
{
  ["name"] = "Alice",
  ["age"] = 28,
  ["department"] = "accounting"
}
```

Table traversal is handled with the `pairs` function which will traverse all key-value pairs in an undefined order.

```lua
t = {10, print, x = 12, k = "hi"}
for k, v in pairs(t) do
  print(k, v)
end
--> 1   10
--> k   hi
--> 2   function: 0x420610
--> x   12
```

To traverse sequences we instead use the `ipairs` function which is trivially ordered.

```lua
t = {10, print, 12, "hi"}
for k, v in ipairs(t) do
  print(k, v)
end
--> 1   10
--> 2   function: 0x420610
--> 3   12
--> 4   hi
```

&nbsp;
# Type Equality

The standard equality operators over objects compare reference equality.
But Lua supports structural equality through metamethods.

```lua
local mt = {
  __eq = function(a, b)
    return a.species == b.species
        and a.length == b.length
        and a.color == b.color
  end
}

local function newFish(o)
  o = o or {}
  setmetatable(o, mt)
  return o
end

local trout = newFish({
  species = "trout",
  length = 30,
  color = "silver",
})

local identicalTrout = newFish({
  species = "trout",
  length = 30,
  color = "silver",
})

local salmon = newFish({
  species = "salmon",
  length = 28,
  color = "silver",
})

assert(trout == identicalTrout)
assert(trout == salmon) --> assertion failed!
```

&nbsp;
# Aside: Defining an AST Type

Lua is commonly used to create domain specific languages. While Lua does not use an abstract syntax tree in its own implementation they are common and [Metalua](http://lua-users.org/wiki/MetaLua) provides an alternative compiler that does define an AST. Possibly the most idiomatic way to handle an AST tree type in Lua is tagged tables. And some form of dynamic dispatch, be it if statements or anonymous tables.

```lua
function Literal(v)
  return { _tag = "literal", v = v }
end

function BinaryOp(token, e1, e2)
  return { _tag = "binop", _token = token, e1, e2 }
end

function UnaryOp(token, e)
  return { _tag = "unop", _token = token, e }
end

function Eval(e)
  if e._tag == "literal" then
    return e.v
  elseif e._tag == "binop" then
    return ({
      ["+"] = function(a, b) return Eval(a) + Eval(b) end,
      ["-"] = function(a, b) return Eval(a) - Eval(b) end,
      ["*"] = function(a, b) return Eval(a) * Eval(b) end,
      ["/"] = function(a, b) return Eval(a) / Eval(b) end,
    })[e._token](e[1], e[2])
  elseif e._tag == "unop" then
    return ({
      ["-"] = function(a) return -Eval(a) end,
    })[e._token](e[1])
  end
end

print(Eval(BinaryOp("+", Literal(1), Literal(2)))) --> 3
```

&nbsp;
# Garbage collection

Lua uses an incremental garbage collector that runs interleaved with the interpreter. A garbage collection cycle has four phases: *mark, cleaning, sweep* and *finalization*.
\
\
The **mark phase** begins by marking alive its root set, which is only the C registry (both the main thread and the global environment are defined here). Any object stored in an alive object is reachable by the program and therefore marked as alive too.
\
\
The **cleaning phase** handles finalizers and weak tables. Lua traverses all objects marked for finalization and resurrects those not marked as alive and puts them into a separate list to be used in the finalization phase. Then Lua traverses weak tables and removes from them all entries wherin either the key or value is not marked.
\
\
The **sweep phase** traverse all Lua objects which are maintained in a linked list. If an object is not marked as alive Lua collecs it, otherwise it removes the mark in preparation for then ext cycle.
\
\
In the **finaliztion phase**, Lua calls the finalizers of all objects that were separated in the cleaning phase.
\
\
Lua also has *emergency collection* which will force a full garbage collection cycle when memory allocation fails and try again. There is also a function called `collectgarbage` that allows some control over the garbage collector. Such as stopping or forcing a collection cycle or setting how often to run a cycle.

&nbsp;
## Weak tables, ephemeron tables, and finalizers

The garbage collector cannot guess what we deem to be garbage. Leftover variables such as in a generic stack program maintain references such that objects are not seen as garbage by Lua. Similarly, any object stored in a global variable is not garbage to Lua. It is up to the programmer to assign nil to these locations so that they can be collected at the end of their lifetime. But what if we want to keep a list of live objects without preventing them from being collected?
\
\
**Weak tables** can hold weak references to objects without preventing them from being collected. Weak tables can have weak keys, weak values, or both.

```lua
setmetatable({}, { __mode = "kv" })
```

A typical problem occurs when, in a table with weak keys, a value refers to its own key. From the standard interpretation of weak tables, that entry would never be collected from the table.
\
\
**Ephemeron tables** solve this problem. Since Lua 5.2, the reference to a value is only strong if there is some other external reference to the key. Otherwise the garbage collector will eventually collect the key and remove the entry from the table.
\
\
**Finalizers** are functions that are installed in an object to be called when that object is collected. They can be useful for extra cleanup or logging.

```lua
setmetatable({}, { __gc = function(o) print("I am being collected") end })
```

&nbsp;
# Polymorphism

Since Lua is dynamically typed, there are no generic types and Lua is implicitly polymorphic. Parametric polymorphism does not exist in Lua, but it does have ad-hoc polymorphism through duck typing. So we may call a function passing any value as long as it implements the required traits. There is no static checking for traits but we can implement runtime checking.

```lua
function requireTrait(o, trait)
  assert(
    type(o[trait]) == "function",
    string.format("%s Missing required trait '%s'", o, trait)
  )
end
```

Metamethods are another form of ad-hoc polymorphism in Lua that allow overloading of operators and behaviors.

```lua
local v = setmetatable({ x = 1, y = 2 }, {
  __add = function(a, b)
    return { x = a.x + b.x, y = a.y + b.y }
  end
})

local w = setmetatable({ x = 3, y = 4 }, getmetatable(v))

local sum = v + w
print(sum.x, sum.y) --> 4   6
```

&nbsp;
# Type Inference

Lua does not have static types so there is no type inference. All variables and function parameters are untyped. Lua does not require or infer types during variable declaration, function definition, or application.
\
\
However, we can inspect the type of a value at runtime with the `type` function to perform some action or call a specified function dynamically.

```lua
print(({
  ["nil"]      = function() print("nil") end,
  ["boolean"]  = function() print("boolean") end,
  ["number"]   = function() print("number") end,
  ["string"]   = function() print("string") end,
  ["userdata"] = function() print("userdata") end,
  ["function"] = function() print("function") end,
  ["thread"]   = function() print("thread") end,
  ["table"]    = function() print("table") end,
})[type(5)]()) --> number
```

There is also a statically typed dialect of Lua called [Teal](https://teal-language.org/).

&nbsp;
# Static Analysis

Lua is a dynamically typed, interpreted language, so many errors are delayed to runtime. However Lua has a strict module `std.strict` that requires all variables (including functions) to be declared through regular assignment, `nil` is fine. `std.strict` returns a proxy table to the given environment. You may need to install the module with Luarocks.

```lua
-- To use the local environment from this scope.
local _ENV = require 'std.strict' (_ENV)
-- To use the global environment from this scope.
local _ENV = require 'std.strict' (_G)
-- Or, prevent all access to global environment.
local _ENV = require 'std.strict' {}

print(g)
--> strict.lua:2: variable 'g' is not declared
```

Lua does also prevent unreachable code via `return` statements by requiring that a `return` only occur as the last statement within a block or chunk. Recall that Lua compiles every chunk as an anonymous function so a `return` may also occur as the last statement in your program. This is related to the module system so we will talk about it in a later section.

```lua
function a()
  if true then return end -- ok
  return -- not ok
  do return end -- ok
  return -- ok
end

return -- ok
```

&nbsp;
# Object Oriented Programming

Lua tables are like objects in that they have a state, an identity `self`, and life cycles independent of who created them or where they were created. Tables can have methods.

```lua
Account = { balance = 0 }
function Account:withdraw(v)
  self.balance = self.balance - v
end
```

The colon is a syntactic facility to add an extra argument or parameter to the function. The following are equivalent:

```lua
Account.withdraw(Account, 42)
Account:withdraw(42)
```

There are no classes in Lua, instead each object may have a prototype. Using the idea of inheritance, if we have two objects A and B, we can make A inherit from B as such:

```lua
setmetatable(A, { __index = B })
```

Now, A looks up in B any value or method that it does not have. And the result is essentially the following if A lacks an operation:

```lua
getmetatable(A).__index.operation(A {, v})
```

If A had redefined the operation then its version would be called, allowing Lua to support dynamic method dispatch. And since Lua is also dynamically typed it supports subtyping and objects can implement the interfaces of other objects.
\
\
Lua can also implement multiple inheritance by using a function as an `__index` metamethod instead. Here we create a constructor for new classes.

```lua
-- search for method in parents
local function search(k, plist)
  for i = 1, #plist do
    local v = plist[i][k]
    if v then return v end
  end
end

function createClass(...)
  local c = {}
  local parents = {...}

  -- class search for absent methods in its list of parents
  setmetatable(c, { __index = function(t, k)
    local v = search(k, parents)
    t[k] = v -- cache
    return v
  end})

  -- prepare c to be the metatable of its instances
  c.__index = c

  -- define new constructor for this class
  function c:new(o)
    o = o or {}
    setmetatable(o, c)
    return o
  end

  return c
end
```

Lua objects do not provide privacy so if we desire to encapsulate some data with operation on that data without simply appending the name with an underscore to signal that it should be private, we need to use Lua's flexibility. Three methods of privacy are closures, the single method approach, and dual representation. The key idea is to represent an object through two tables: one for its state and one for its operations.

```lua
-- closures
function newAccount(initialBalance)
  local self = { balance = initialBalance }
  local withdraw = function(v)
    self.balance = self.balance - v
  end
  local deposit = function(v)
    self.balance = self.balance + v
  end
  local getBalance = function()
    return self.balance
  end
  return {
      withdraw = withdraw,
      deposit = deposit,
      getBalance = getBalance,
  }
end

-- single method
function newObject(value)
  return function (action, v)
    if action == "get" then return value
    elseif action == "set" then value = v
    else error("invalid action", 2)
    end
  end
end

-- dual representation

-- Accounts class using dual representation PIL-4th chapter 21.3
-- comparable cost as the original in terms of time and memory
-- allows the balance to be private and keep inheritance
-- requires more work from the garbage collector as old
-- accounts will not be removed from the balances table

local balance = {}

Account = {}

function Account:withdraw(v)
  balance[self] = balance[self] - v
end

function Account:deposit(v)
  balance[self] = balance[self] + v
end

function Account:balance()
  return balance[self]
end

function Account:new(o)
  o = o or {}   -- create table if user does not provide one
  setmetatable(o, self)
  self.__index = self
  balance[o] = 0   -- initial balance
  return o
end

a = Account:new()
a:deposit(100.0)
print(a:balance())
```

&nbsp;
# Modules

Modules in Lua are implemented as tables. Particularly, modules are first class values. We load modules with the `require` function which takes a single argument, the module name, and has no special privileges. `require` uses a suite of *searchers* (a function that returns a *loader* or `nil`) to find and load a module. If `require` cannot find a Lua file with the module name it searches for a C library. For a user, a *module* is just some code in Lua or C that can be loaded through the function `require` and that creates and returns a table.

```lua
local m = require 'mod'
m.foo()

local f = m.foo
f()

-- just require a single method
local f = require 'mod'.foo
f()
```

Recall however, that a Lua chunk is compiled as an anonymous function. Typically module code will return a table but modules may instead decide to return other values or have side effects such as creating global variables.
\
\
Loaded packages are in the `package.loaded` table. If we try to `require` the same package, `require` will just return the one we already have. We can force a reload of the package by removing it from `package.loaded` (set the value to `nil`) and allow it to be garbage collected.
\
\
A module can return a package in multiple ways. Some common ones are

```lua
-- common
local M = {}
return M
```
```lua
-- export list
return {
    a = a
    b = b
    c = c
}
```
```lua
-- directly
local M = {}
package.loaded[...] = M -- the varag expression contains the module name
```

`require` cannot pass values to a module so if you need initialization include an `init` function within your module. If `init` returns your module you can do this in the calling code:

```lua
M = require 'mod'.init(value)
```

By default all values in Lua are global so we need to explicitly declare private parts of a module as `local`.

```lua
local M = {}
local function privateFun() end
function M.publicFun() end
return M
```

Here are two small modules that you implement as part of exercises 17.1 and 17.2 of Programming in Lua 4th edition.

```lua
-- 17.1 double ended queue
-- This module provides functions to modify a double
-- ended queue. This could be made into a class.

local deque = {}

function deque.listNew()
  return { first = 0, last = -1 }
end

-- deque.list = listNew()

function deque.pushFirst(list, value)
  local first = list.first - 1
  list.first = first
  list[first] = value
end

function deque.pushLast(list, value)
  local last = list.last + 1
  list.last = last
  list[last] = value
end

function deque.popFirst(list)
  local first = list.first
  if first > list.last then error("list is empty") end
  local value = list[first]
  list[first] = nil   -- to allow garbage collection
  list.first = first + 1
  return value
end

function deque.popLast(list)
  local last = list.last
  if list.first > last then error("list is empty") end
  local value = list[last]
  list[last] = nil   -- to allow garbage collection
  list.last = last - 1
  return value
end

return deque
```

```lua
-- 17.2 union intersection difference module

local function union(r1, r2)
  return function(x, y)
    return r1(x, y) or r2(x, y)
  end
end

local function intersection(r1, r2)
  return function(x, y)
    return r1(x, y) and r2(x, y)
  end
end

local function difference(r1, r2)
  return function(x, y)
    return r1(x, y) and not r2(x, y)
  end
end

return {
  union        = union,
  intersection = intersection,
  difference   = difference,
}
```

Here is a module implementing breakpoints with the debug library. Exercise 25.7 of Programming in Lua 4th edition.

```lua
-- 25.7 Write a library for breakpoints. Include
--
-- setbreakpoint(function, line) --> returns handle
-- removebreakpoint(handle)
--
-- We specify a breakpoint by a function and a line inside that function.
-- When the program hits a breakpoint, the library should call debug.debug.
-- (Use a line hook for a basic implementation. Use a call hook that enables
-- the line hook only when running the target function for a more efficient
-- implementation)

-- Must type 'cont' inside debug.debug to finish the debug function not ctrl-d

local M = {}

--[[
  Table of breakpoints
  key: function
  value: Table {
    key: handle as an auto-incrementing number
    value: line number
    ...
    n: number of breakpoints in this function
  }
--]]
local breakpoints = {}

--[[
  Set a breakpoint
  -> handle: string
  func: function
  line: number
--]]
local count = 0 -- auto-incrementing handle
function M.setbreakpoint(func, line)
  if type(func) ~= "function" then
    error("bad argument 1 to setbreakpoint: expected function", 2)
  end
  if type(line) ~= "number" then
    error("bad argument 2 to setbreakpoint: expected number", 2)
  end
  count = count + 1

  local bp = breakpoints[func] or {}
  bp[count] = line
  bp.n = (bp.n or 0) + 1
  breakpoints[func] = bp

  return count
end

--[[
  Remove a breakpoint
  handle: string
--]]
function M.removebreakpoint(handle)
  for _, bps in pairs(breakpoints) do
    if bps[handle] then
      bps[handle] = nil
      bps.n = bps.n - 1
    end
  end
end

local callhook

local function linehook()
  local info = debug.getinfo(2, "fl")

  local bps = breakpoints[info.func]
  if bps and bps.n > 0 then
    for handle, line in pairs(bps) do
      if info.currentline == line then
        print(string.format("breakpoint found: %d", handle))
        debug.debug()
      end
    end
  else
    debug.sethook(callhook, "cr")
  end
end

function callhook()
  local func = debug.getinfo(2, "f").func

  local bps = breakpoints[func]
  if bps and bps.n > 0 then
    debug.sethook(linehook, "l")
  end
end

debug.sethook(callhook, "cr")

return M
```
