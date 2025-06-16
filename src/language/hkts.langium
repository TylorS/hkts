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
    ForOfStatement |
    WhileStatement |
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
    TypeclassDeclaration |
    EffectDeclaration |
    InstanceDeclaration;

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
    (effects=EffectSignature)?
    block=Block;

ParameterDeclaration:
    name=Identifier 
    (":" type=Type)?;

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
    ";"?;

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

EffectDeclaration:
    (exported?="export")? 
    "effect" 
    name=Identifier 
    parameters=TypeParameterList? 
    "{" 
    (operations+=EffectOperation)* 
    "}";

EffectOperation:
    name=Identifier 
    ":" 
    type=Type;

EffectSignature:
    "{"
    effects+=TypeReference 
    ("," effects+=TypeReference)*
    "}";

InstanceDeclaration:
    (exported?="export")? 
    "instance" 
    name=Identifier 
    ":" 
    typeclass=TypeReference
    ("extends" extends+=InstanceReference ("," extends+=InstanceReference)*)?
    "{" 
    (implementations+=InstanceImplementation)* 
    "}";

InstanceExpression:
    "instance" 
    typeclass=TypeReference
    ("extends" extends+=InstanceReference ("," extends+=InstanceReference)*)?
    "{" 
    (implementations+=InstanceImplementation)* 
    "}";

InstanceImplementation:
    name=Identifier ":" value=Expression |
    name=Identifier "(" parameters+=ParameterDeclaration ("," parameters+=ParameterDeclaration)* ")" "=>" value=Expression;

InstanceReference:
    instance=Identifier;

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

ForOfStatement:
    "for" 
    "(" 
    variable=Identifier 
    "of" 
    iterable=Expression 
    ")" 
    body=Block;

WhileStatement:
    "while" 
    "(" condition=Expression ")" 
    body=Block;

// =============================================
// Expressions
// =============================================
Expression:
    WithExpression;

WithExpression:
    EqualityExpression 
    (
        {infer WithExpression.computation=current} 
        "with" 
        handler=EqualityExpression
    )?;

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
    UnaryExpression 
    (
        {infer BinaryExpression.left=current} 
        operator=(MultiplicationOperator | DivisionOperator) 
        right=UnaryExpression
    )*;

UnaryExpression:
    PrefixUnaryExpression | PostfixUnaryExpression | PrimaryExpression;

PrefixUnaryExpression:
    operator=(IncrementOperator | DecrementOperator) 
    operand=PrimaryExpression;

PostfixUnaryExpression:
    operand=PrimaryExpression 
    operator=(IncrementOperator | DecrementOperator);

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

IncrementOperator:
    text='++';

DecrementOperator:
    text='--';

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
    InstanceExpression |
    HandlerExpression |
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
    (effects=EffectSignature)?
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

// =============================================
// Handler Expression
// =============================================
HandlerExpression:
    "handle" 
    effect=TypeReference
    "{" 
    (bindings+=LetDeclaration)*
    (
        handlers+=OperationHandler 
        ("," handlers+=OperationHandler)*
    )?
    "}";

OperationHandler:
    operation=Identifier 
    "(" 
    (
        parameters+=Identifier 
        ("," parameters+=Identifier)*
    )? 
    ")" 
    "=>" 
    body=Expression;

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
    id=ID | 
    // Keywords should also be able to be used as identifiers
    id=('data'|'effect'|'else'|'export'|'extends'|'for'|'fun'|'handle'|'if'|'instance'|'let'|'match'|'return'|'type'|'typeclass'|'while'|'with');

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
    UnionType | IntersectionType | PostfixType;

UnionType:
    types+=(PostfixType | IntersectionType) 
    ("|" types+=(IntersectionType | PostfixType))+;

IntersectionType:
    types+=PostfixType 
    ("&" types+=PostfixType)+;

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
    ParenthesizedType;

ParenthesizedType:
    "(" type=Type ")";

FunctionType:
    "(" 
    (
        parameters+=FunctionTypeParameter 
        ("," parameters+=FunctionTypeParameter)*
    )? 
    ")" 
    "=>" 
    returnType=Type
    (effects=EffectSignature)?;

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

terminal ID: 
    /[a-zA-Z_][a-zA-Z0-9_]*/;

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

terminal SINGLE_LINE_COMMENT: 
    /\/\/[^\n\r]*/;

terminal MULTI_LINE_COMMENT: 
    /\/\*[\s\S]*?\*\//;

hidden terminal WS: 
    /\s+/;
