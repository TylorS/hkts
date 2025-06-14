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
    (async?="async")?
    "fun" 
    (generator?="*")? 
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
    ObjectLiteral;

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
    {infer BooleanLiteral} text=BOOLEAN;

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
    PrimitiveType |
    TypeReference;

PrimitiveType:
    name=("string" | "number" | "boolean" | "void");

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

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;