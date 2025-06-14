# Higher-Kinded TypeScript Grammar Features

## Core Language Features

### Statements

- [x] Comment
- [x] Multiline Comments
- [x] Function Declaration
- [x] Let Declaration
- [x] if/else-if/else statements
- [x] ExpressionStatement
- [x] Return Statement

### Expressions
- [x] Binary Expressions
  - [x] Addition/Subtraction
  - [x] Multiplication/Division
  - [x] Equality/Inequality
  - [x] Comparison (<, >, <=, >=)
- [x] Primary Expressions
  - [x] Boolean Literals
  - [x] String Literals
  - [x] Number Literals
  - [x] Identifiers
  - [x] Array Literals
  - [x] Object Literals
  - [x] Function Expressions
  - [x] Call Expressions
  - [x] Member Expressions
- [x] Destructuring
  - [x] Array Destructuring
  - [x] Object Destructuring
  - [x] Rest/Spread Operator

### Function Features
- [x] Function Expressions
  - [x] Arrow Functions (`fun (x: Number) => x + 1`)
  - [x] Block Functions (`fun (x: Number) { return x + 1; }`)
  - [x] Optional Return Type Annotation
  - [x] Nested Function Expressions
- [x] Call Expressions
  - [x] Function Calls (`add(1, 2)`)
  - [x] Method Calls (`user.greet("Hello")`)
  - [x] Nested Function Calls
  - [x] Zero or More Arguments

### Member Access
- [x] Member Expressions
  - [x] Dot Notation (`user.name`)
  - [x] Bracket Notation (`user["name"]`, `items[0]`, `obj[key]`)
  - [x] Dynamic Property Access
  - [x] Integration with Function Calls

### Type System
- [x] Primitive Types (`String`, `Number`, `Boolean`, `Unit`)
- [x] Type References (Custom types)
- [x] Function Types
  - [x] Anonymous Parameters (`(Number, String) => Boolean`)
  - [x] Named Parameters (`(x: Number, name: String) => Boolean`)
  - [x] Mixed Parameter Types
  - [x] No Parameters (`() => String`)
  - [x] Nested Function Types (`(Number) => (String) => Boolean`)
  - [x] Higher-Order Function Types

