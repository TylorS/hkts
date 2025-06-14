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
    LetDeclaration | 
    DataDeclaration |
    TypeAliasDeclaration |
    TypeclassDeclaration;

FunctionDeclaration:
    (exported?="export")?
    "fun" 
    name=Identifier 
    typeParameters=TypeParameterList?
    "(" 
    (
        parameters+=ParameterDeclaration 
        ("," parameters+=ParameterDeclaration)*
    )? 
    ")" 
    (":" returnType=Type)? 
    block=Block;

ParameterDeclaration:
    name=Identifier 
    ":" 
    type=Type;

Block:
    "{" 
    statements+=Statement* 
    "}";

LetDeclaration:
    (exported?="export")? 
    "let" 
    name=(
        Identifier |
        ArrayDestructuring |
        ObjectDestructuring
    ) 
    (":" type=Type)? 
    "=" 
    value=Expression 
    ";"?;

ArrayDestructuring:
    "[" 
    destructured+=Identifier 
    ("," destructured+=Identifier)* 
    "]";

ObjectDestructuring:
    "{" 
    (
        properties+=ObjectDestructuringProperty 
        ("," properties+=ObjectDestructuringProperty)*
    )? 
    "}";

ObjectDestructuringProperty:
    RestSpread | 
    PropertyPattern;

PropertyPattern:
    key=Identifier 
    (":" target=Identifier)?;

RestSpread:
    "..." name=Identifier;

Comment:
    text=SINGLE_LINE_COMMENT;

MultiLineComment:
    text=MULTI_LINE_COMMENT;

DataDeclaration:
    (exported?="export")? 
    "data" 
    name=Identifier 
    parameters=TypeParameterList? 
    "=" 
    (
        constructors+=ConstructorDeclaration 
        ("|" constructors+=ConstructorDeclaration)*
    )?;

ConstructorDeclaration:
    VoidConstructor |
    TupleConstructor |
    ObjectConstructor;

VoidConstructor:
    name=Identifier;

TupleConstructor:
    name=Identifier 
    "(" 
    (
        parameters+=TupleConstructorParameter 
        ("," parameters+=TupleConstructorParameter)*
    )? 
    ")";

TupleConstructorParameter:
    (name=Identifier ":")? 
    type=Type;

ObjectConstructor:
    name=Identifier 
    "{" 
    (
        parameters+=PropertyType 
        ("," parameters+=PropertyType)*
    )? 
    "}";

TypeAliasDeclaration:
    (exported?="export")? 
    "type" 
    name=Identifier 
    parameters=TypeParameterList? 
    "=" 
    aliasType=Type 
    ";";

TypeclassDeclaration:
    (exported?="export")? 
    "typeclass" 
    name=Identifier 
    parameters=TypeParameterList? 
    "{" 
    (properties+=TypeclassProperty)* 
    "}";

TypeclassProperty:
    name=Identifier 
    ":" 
    type=Type;

// =============================================
// Control Flow Statements
// =============================================
ReturnStatement:
    "return" 
    expression=Expression? 
    ";"?;

IfStatement:
    "if" 
    "(" condition=Expression ")" 
    then=Block 
    (elseIfs+=ElseIfClause)* 
    (else=ElseClause)?;

ElseIfClause:
    "else" 
    "if" 
    "(" condition=Expression ")" 
    then=Block;

ElseClause:
    "else" 
    block=Block;

// =============================================
// Expressions
// =============================================
Expression:
    EqualityExpression;

EqualityExpression:
    ComparisonExpression 
    (
        {infer BinaryExpression.left=current} 
        operator=(EqualityOperator | InequalityOperator) 
        right=ComparisonExpression
    )*;

ComparisonExpression:
    AdditiveExpression 
    (
        {infer BinaryExpression.left=current} 
        operator=ComparisonOperator 
        right=AdditiveExpression
    )*;

AdditiveExpression:
    MultiplicativeExpression 
    (
        {infer BinaryExpression.left=current} 
        operator=(AdditionOperator | SubtractionOperator) 
        right=MultiplicativeExpression
    )*;

MultiplicativeExpression:
    PrimaryExpression 
    (
        {infer BinaryExpression.left=current} 
        operator=(MultiplicationOperator | DivisionOperator) 
        right=PrimaryExpression
    )*;

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
    CallExpression |
    MemberExpression |
    MatchExpression |
    "(" Expression ")";

// =============================================
// Member Expression
// =============================================
MemberExpression:
    object=Identifier "." property=Identifier |
    object=Identifier "[" property=Expression "]";

// =============================================
// Call Expression
// =============================================
CallExpression:
    callee=(Identifier | MemberExpression) 
    "(" 
    (
        arguments+=Expression 
        ("," arguments+=Expression)*
    )? 
    ")";

// =============================================
// Function Expression
// =============================================
FunctionExpression:
    "fun" 
    "(" 
    (
        parameters+=ParameterDeclaration 
        ("," parameters+=ParameterDeclaration)*
    )? 
    ")" 
    (":" returnType=Type)? 
    (
        ("=>" body=Expression) |
        body=Block
    );

// =============================================
// Match Expression & Patterns
// =============================================
MatchExpression:
    "match" 
    "(" target=Expression ")" 
    "{" 
    (cases+=MatchCase)* 
    "}";

MatchCase:
    pattern=Pattern 
    (guard=GuardExpression)? 
    "=>" 
    (
        body=Expression ";" | 
        body=Block
    );

GuardExpression:
    "if" condition=Expression;

Pattern:
    TypedPattern;

TypedPattern:
    BasePattern 
    (
        {infer TypedPattern.pattern=current} 
        ":" type=Type
    )?;

BasePattern:
    PrimaryPattern;

PrimaryPattern:
    ArrayPattern |
    ObjectPattern |
    WildcardPattern |
    LiteralPattern |
    ConstructorPattern |
    VariablePattern |
    "(" Pattern ")";

WildcardPattern:
    text="_";

LiteralPattern:
    value=Literal;

ArrayPattern:
    "[]" |
    "[" 
    (
        patterns+=Pattern 
        ("," patterns+=Pattern)*
    )? 
    ("," "..." restPattern=Identifier)? 
    "]";

ObjectPattern:
    "{" 
    (
        fields+=FieldPattern 
        ("," fields+=FieldPattern)*
    )? 
    ("," "..." restPattern=Identifier)? 
    "}";

ConstructorPattern:
    constructor=Identifier 
    "(" 
    (
        patterns+=Pattern 
        ("," patterns+=Pattern)*
    )? 
    ")" |
    constructor=Identifier 
    pattern=ObjectPattern;

VariablePattern:
    name=Identifier;

FieldPattern:
    field=Identifier ":" pattern=Pattern |
    field=Identifier;

// =============================================
// Literals
// =============================================
Identifier:
    id=ID;

Literal:
    BooleanLiteral |
    StringLiteral |
    IntegerLiteral |
    FloatLiteral |
    BigIntLiteral |
    BigDecimalLiteral;

BooleanLiteral:
    text=BOOLEAN;

StringLiteral:
    text=STRING;

IntegerLiteral:
    text=INTEGER;

FloatLiteral:
    text=FLOAT;

BigIntLiteral:
    text=BIGINT;

BigDecimalLiteral:
    text=BIGDECIMAL;

ArrayLiteral:
    "[" 
    (
        elements+=Expression 
        ("," elements+=Expression)*
    )? 
    "]";

ObjectLiteral:
    "{" 
    (
        properties+=Property 
        ("," properties+=Property)*
    )? 
    "}";

Property:
    key=Identifier 
    (":" value=Expression)?;

// =============================================
// Types
// =============================================
Type:
    PostfixType;

TypeParameterList:
    "<" 
    (
        parameters+=(TypeParameter) 
        ("," parameters+=(TypeParameter))*
    )? 
    ">";

TypeParameter:
    name=Identifier (":" type=Type)? |
    name=Identifier arguments=TypeArgumentList?;

PostfixType:
    PrimaryType 
    (
        {infer ArrayType.elementType=current} 
        "[]"
    )*;

PrimaryType:
    FunctionType |
    PrimitiveType |
    LiteralType |
    TypeReference |
    ObjectType |
    TupleType |
    TypeHole |
    "(" Type ")";

FunctionType:
    "(" 
    (
        parameters+=FunctionTypeParameter 
        ("," parameters+=FunctionTypeParameter)*
    )? 
    ")" 
    "=>" 
    returnType=Type;

FunctionTypeParameter:
    (name=Identifier ":")? 
    type=Type;

PrimitiveType:
    name=(
        "String" | 
        "Int" | 
        "Int64" | 
        "BigInt" | 
        "Float32" | 
        "Float64" | 
        "BigDecimal" | 
        "Boolean" | 
        "Unit" | 
        "!" | 
        "unknown"
    );

LiteralType:
    BooleanLiteralType |
    StringLiteralType |
    IntegerLiteralType |
    FloatLiteralType |
    BigIntLiteralType |
    BigDecimalLiteralType;

BooleanLiteralType:
    text=BOOLEAN;

StringLiteralType:
    text=STRING;

IntegerLiteralType:
    text=INTEGER;

FloatLiteralType:
    text=FLOAT;

BigIntLiteralType:
    text=BIGINT;

BigDecimalLiteralType:
    text=BIGDECIMAL;

ObjectType:
    "{" 
    (
        properties+=(PropertyType | SpreadType) 
        ("," properties+=(PropertyType | SpreadType))*
    )? 
    "}";

PropertyType:
    key=Identifier 
    ":" 
    type=Type;

TupleType:
    "[" 
    (
        types+=(Type | SpreadType) 
        ("," types+=(Type | SpreadType))*
    )? 
    "]";

SpreadType:
    "..." type=Type;

TypeReference:
    name=Identifier 
    (typeArguments=TypeArgumentList)?;

TypeArgumentList:
    "<" 
    (
        arguments+=TypeArgument 
        ("," arguments+=TypeArgument)*
    )? 
    ">";

TypeArgument:
    Type | 
    TypeHole;

TypeHole:
    hole="_";

// =============================================
// Terminals
// =============================================
terminal BOOLEAN: 
    /true|false/;

terminal STRING: 
    /"[^"]*"/ | 
    /'[^']*'/;

terminal BIGDECIMAL: 
    /[0-9]+\.[0-9]+n/;

terminal BIGINT: 
    /[0-9]+n/;

terminal FLOAT: 
    /[0-9]+\.[0-9]+/;

terminal INTEGER: 
    /[0-9]+/;

terminal ID: 
    /[a-zA-Z_][a-zA-Z0-9_]*/;

terminal SINGLE_LINE_COMMENT: 
    /\/\/[^\n\r]*/;

terminal MULTI_LINE_COMMENT: 
    /\/\*[\s\S]*?\*\//;

hidden terminal WS: 
    /\s+/;
