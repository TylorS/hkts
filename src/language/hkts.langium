grammar HigherKindedTypeScript

// =============================================
// Entry Point
// =============================================
entry SourceFile:
    statements+=Statement*;

// =============================================
// Statements
// =============================================
Statement:
    Comment |
    MultiLineComment |
    Declaration |
    ReturnStatement |
    IfStatement |
    ExpressionStatement;

ExpressionStatement:
    expression=Expression ";"?;

// =============================================
// Declarations
// =============================================
Declaration:
    FunctionDeclaration |
    LetDeclaration;

FunctionDeclaration:
    (exported?="export")?
    "fun" 
    name=Identifier 
    "(" 
    (parameters+=ParameterDeclaration ("," parameters+=ParameterDeclaration)*)? 
    ")" 
    (":" returnType=Type)? 
    block=Block;

ParameterDeclaration:
    name=Identifier 
    ":" 
    type=Type;

Block:
    "{" statements+=Statement* "}";

LetDeclaration:
    (exported?="export")? "let" name=(Identifier|ArrayDestructuring|ObjectDestructuring) (":" type=Type)? "=" value=Expression ";"?;

ArrayDestructuring:
    "[" destructured+=Identifier ("," destructured+=Identifier)* "]";

ObjectDestructuring:
    "{" (properties+=ObjectDestructuringProperty ("," properties+=ObjectDestructuringProperty)*)? "}";

ObjectDestructuringProperty:
    RestSpread | PropertyPattern;

PropertyPattern:
    key=Identifier (":" target=Identifier)?;

RestSpread:
    "..." name=Identifier;

Comment:
    text=SINGLE_LINE_COMMENT;

MultiLineComment:
    text=MULTI_LINE_COMMENT;

// =============================================
// Statements
// =============================================
ReturnStatement:
    "return" expression=Expression? ";"?;

IfStatement:
    "if" "(" condition=Expression ")" then=Block 
    (elseIfs+=ElseIfClause)* 
    (else=ElseClause)?;

ElseIfClause:
    "else" "if" "(" condition=Expression ")" then=Block;

ElseClause:
    "else" block=Block;

// =============================================
// Expressions
// =============================================
Expression:
    EqualityExpression;

EqualityExpression:
    ComparisonExpression ({infer BinaryExpression.left=current} operator=(EqualityOperator | InequalityOperator) right=ComparisonExpression)*;

ComparisonExpression:
    AdditiveExpression ({infer BinaryExpression.left=current} operator=ComparisonOperator right=AdditiveExpression)*;

AdditiveExpression:
    MultiplicativeExpression ({infer BinaryExpression.left=current} operator=(AdditionOperator | SubtractionOperator) right=MultiplicativeExpression)*;

MultiplicativeExpression:
    PrimaryExpression ({infer BinaryExpression.left=current} operator=(MultiplicationOperator | DivisionOperator) right=PrimaryExpression)*;

// =============================================
// Operators
// =============================================

AdditionOperator:
    text='+';

SubtractionOperator:
    text='-';

MultiplicationOperator:
    text='*';

DivisionOperator:
    text='/';

EqualityOperator:
    text='==';

InequalityOperator:
    text='!=';

ComparisonOperator:
    operator=LessThanOperator |
    operator=GreaterThanOperator |
    operator=LessThanOrEqualOperator |
    operator=GreaterThanOrEqualOperator;

LessThanOperator:
    text='<';

GreaterThanOperator:
    text='>';

LessThanOrEqualOperator:
    text='<=';

GreaterThanOrEqualOperator:
    text='>=';

// =============================================
// Primary Expressions
// =============================================
PrimaryExpression:
    Literal |
    Identifier |
    ArrayLiteral |
    ObjectLiteral |
    FunctionExpression |
    CallExpression;

// =============================================
// Call Expression
// =============================================
CallExpression:
    callee=Identifier "(" (arguments+=Expression ("," arguments+=Expression)*)? ")";

// =============================================
// Function Expression
// =============================================
FunctionExpression:
    "fun" 
    "(" 
    (parameters+=ParameterDeclaration ("," parameters+=ParameterDeclaration)*)? 
    ")" 
    (":" returnType=Type)? 
    (
        ("=>" body=Expression) |
        body=Block
    );

// =============================================
// Literals
// =============================================
Identifier:
    id=ID;

Literal:
    BooleanLiteral |
    StringLiteral |
    NumberLiteral;

BooleanLiteral:
    text=BOOLEAN;

StringLiteral:
    text=STRING;

NumberLiteral:
    text=NUMBER |
    text=FLOAT;

ArrayLiteral:
    "[" (elements+=Expression ("," elements+=Expression)*)? "]";

ObjectLiteral:
    "{" (properties+=Property ("," properties+=Property)*)? "}";

Property:
    key=Identifier ":" value=Expression;

// =============================================
// Types
// =============================================
Type:
    FunctionType |
    PrimitiveType |
    TypeReference;

FunctionType:
    "(" (parameters+=FunctionTypeParameter ("," parameters+=FunctionTypeParameter)*)? ")" "=>" returnType=Type;

FunctionTypeParameter:
    (name=Identifier ":")? type=Type;

PrimitiveType:
    name=("String" | "Number" | "Boolean" | "Unit");

TypeReference:
    name=Identifier;

// =============================================
// Terminals
// =============================================
terminal BOOLEAN: /true|false/;
terminal STRING: /"[^"]*"/ | /'[^']*'/;
terminal NUMBER: /[0-9]+/;
terminal FLOAT: /[0-9]+\.[0-9]+/;
terminal ID: /[a-zA-Z_][a-zA-Z0-9_]*/;
terminal SINGLE_LINE_COMMENT: /\/\/[^\n\r]*/;
terminal MULTI_LINE_COMMENT: /\/\*[\s\S]*?\*\//;

hidden terminal WS: /\s+/;