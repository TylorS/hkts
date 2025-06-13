grammar HigherKindedTypeScript

// =============================================
// Entry Point
// =============================================
entry SourceFile:
    (statements+=Statement)*;

// =============================================
// Declarations
// =============================================
Statement:
    DecoratedStatement |
    VariableDeclaration |
    FunctionDeclaration |
    ClassDeclaration |
    InterfaceDeclaration |
    TypeAliasDeclaration |
    ImportDeclaration |
    ExportDeclaration |
    NamespaceDeclaration |
    EnumDeclaration |
    ModuleDeclaration |
    ExpressionStatement |
    IfStatement |
    ForStatement |
    WhileStatement |
    DoWhileStatement |
    SwitchStatement |
    TryStatement |
    ReturnStatement |
    BreakStatement |
    ContinueStatement |
    ThrowStatement |
    Block |
    LabeledStatement |
    WithStatement |
    DebuggerStatement |
    ForInStatement |
    ForOfStatement |
    ForAwaitOfStatement;

DecoratedStatement:
    decorators+=Decorator+ statement=Statement;

Decorator:
    '@' expression=Expression;

// Variable Declarations
VariableDeclaration:
    'let' | 'const' | 'var' name=ID typeAnnotation=TypeAnnotation? initializer=Expression? ';' |
    'let' | 'const' | 'var' pattern=DestructuringPattern typeAnnotation=TypeAnnotation? initializer=Expression? ';';

DestructuringPattern:
    ObjectDestructuringPattern |
    ArrayDestructuringPattern;

ObjectDestructuringPattern:
    '{' properties+=DestructuringProperty (',' properties+=DestructuringProperty)* '}';

DestructuringProperty:
    name=PropertyName (':' alias=ID)? |
    rest=RestElement;

ArrayDestructuringPattern:
    '[' elements+=DestructuringElement? (',' elements+=DestructuringElement?)* ']';

DestructuringElement:
    pattern=DestructuringPattern |
    rest=RestElement;

RestElement:
    '...' target=ID;

// Function Declarations
FunctionDeclaration:
    {infer FunctionDeclaration} 'function' name=ID '(' parameters+=Parameter (',' parameters+=Parameter)* ')' 
    (returnType=TypeAnnotation)? body=Block;

// Class Declarations
ClassDeclaration:
    'class' name=ID ('extends' superClass=Expression)? ('implements' interfaces+=Expression (',' interfaces+=Expression)*)? 
    body=ClassBody;

ClassBody:
    '{' members+=ClassMember* '}';

ClassMember:
    DecoratedClassMember |
    MethodDeclaration |
    PropertyDeclaration |
    ConstructorDeclaration |
    GetterDeclaration |
    SetterDeclaration |
    PrivateFieldDeclaration |
    AutoAccessorDeclaration |
    StaticBlock;

DecoratedClassMember:
    decorators+=Decorator+ member=ClassMember;

MethodDeclaration:
    modifiers+=Modifier* name=ID '(' parameters+=Parameter (',' parameters+=Parameter)* ')' 
    returnType=TypeAnnotation? body=Block;

PropertyDeclaration:
    modifiers+=Modifier* name=ID '?'? typeAnnotation=TypeAnnotation? initializer=Expression? ';' |
    modifiers+=Modifier* 'static' name=ID '?'? typeAnnotation=TypeAnnotation? initializer=Expression? ';';

ConstructorDeclaration:
    'constructor' '(' parameters+=Parameter (',' parameters+=Parameter)* ')' body=Block;

GetterDeclaration:
    'get' name=ID '(' ')' returnType=TypeAnnotation? body=Block;

SetterDeclaration:
    'set' name=ID '(' parameter=Parameter ')' body=Block;

PrivateFieldDeclaration:
    '#' name=ID typeAnnotation=TypeAnnotation? initializer=Expression? ';';

AutoAccessorDeclaration:
    modifiers+=Modifier* 'accessor' name=ID typeAnnotation=TypeAnnotation? initializer=Expression? ';';

StaticBlock:
    'static' block=Block;

// Interface Declarations
InterfaceDeclaration:
    'interface' name=ID ('extends' interfaces+=Expression (',' interfaces+=Expression)*)? 
    body=InterfaceBody;

InterfaceBody:
    '{' members+=InterfaceMember* '}';

InterfaceMember:
    MethodSignature |
    PropertySignature |
    ConstructSignature;

MethodSignature:
    name=ID '(' parameters+=Parameter (',' parameters+=Parameter)* ')' returnType=TypeAnnotation? ';';

PropertySignature:
    name=ID '?'? typeAnnotation=TypeAnnotation? ';';

ConstructSignature:
    'new' '(' parameters+=Parameter (',' parameters+=Parameter)* ')' returnType=TypeAnnotation? ';';

// Type Declarations
TypeAliasDeclaration:
    'type' name=ID '=' type=Type ';';

// Import/Export Declarations
ImportDeclaration:
    'import' (defaultImport=ID | '{' namedImports+=NamedImport (',' namedImports+=NamedImport)* '}' | '*') 
    'from' module=StringLiteral attributes=ImportAttributes? ';' |
    'import' '(' dynamicImport=Expression ')' ';' |
    'import' 'type' (defaultImport=ID | '{' namedImports+=NamedImport (',' namedImports+=NamedImport)* '}') 
    'from' module=StringLiteral ';';

ExportDeclaration:
    'export' (declaration=Statement | 'default' expression=Expression) ';' |
    'export' '*' 'from' module=StringLiteral ';' |
    'export' '{' namedExports+=NamedExport (',' namedExports+=NamedExport)* '}' ';' |
    'export' 'type' '{' namedExports+=NamedExport (',' namedExports+=NamedExport)* '}' ';';

NamedExport:
    name=ID ('as' alias=ID)?;

NamedImport:
    name=ID ('as' alias=ID)?;

ImportAttributes:
    'with' '{' attributes+=ImportAttribute (',' attributes+=ImportAttribute)* '}';

ImportAttribute:
    key=ID ':' value=StringLiteral;

// Namespace Declarations
NamespaceDeclaration:
    {infer NamespaceDeclaration} exported=('export')? 'namespace' name=ID body=NamespaceBody;

NamespaceBody:
    '{' statements+=Statement* '}';

// Enum Declarations
EnumDeclaration:
    {infer EnumDeclaration} exported=('export')? 'enum' name=ID body=EnumBody;

EnumBody:
    '{' members+=EnumMember (',' members+=EnumMember)* '}';

EnumMember:
    name=ID ('=' value=Expression)?;

// Module Declarations
ModuleDeclaration:
    'declare' 'module' name=StringLiteral body=ModuleBody |
    'declare' 'global' body=ModuleBody;

ModuleBody:
    '{' statements+=Statement* '}';

// =============================================
// Statements
// =============================================
ExpressionStatement:
    expression=Expression ';'?;

IfStatement:
    'if' '(' condition=Expression ')' thenStatement=Statement ('else' elseStatement=Statement)?;

ForStatement:
    'for' '(' (initializer=VariableDeclaration | initializer=Expression)? ';' 
    condition=Expression? ';' increment=Expression? ')' body=Statement;

ForInStatement:
    'for' '(' ('var' | 'let' | 'const')? left=Expression 'in' right=Expression ')' body=Statement;

ForOfStatement:
    'for' '(' ('var' | 'let' | 'const')? left=Expression 'of' right=Expression ')' body=Statement;

ForAwaitOfStatement:
    'for' 'await' '(' ('var' | 'let' | 'const')? left=Expression 'of' right=Expression ')' body=Statement;

WhileStatement:
    'while' '(' condition=Expression ')' body=Statement;

DoWhileStatement:
    'do' body=Statement 'while' '(' condition=Expression ')' ';';

SwitchStatement:
    'switch' '(' expression=Expression ')' '{' cases+=SwitchCase* '}';

SwitchCase:
    ('case' expression=Expression | 'default') ':' statements+=Statement*;

TryStatement:
    'try' block=Block catchClause=CatchClause? finallyClause=FinallyClause?;

CatchClause:
    'catch' '(' error=ID typeAnnotation=TypeAnnotation? ')' block=Block;

FinallyClause:
    'finally' block=Block;

ReturnStatement:
    'return' expression=Expression? ';'?;

BreakStatement:
    'break' label=ID? ';';

ContinueStatement:
    'continue' label=ID? ';';

ThrowStatement:
    'throw' expression=Expression ';';

LabeledStatement:
    label=ID ':' statement=Statement;

WithStatement:
    'with' '(' expression=Expression ')' statement=Statement;

DebuggerStatement:
    {infer DebuggerStatement} 'debugger' ';';

Block:
    '{' statements+=Statement* '}';

// =============================================
// Expressions
// =============================================
Expression:
    PipelineExpression;

PipelineExpression:
    left=AssignmentExpression ('|>' rights+=AssignmentExpression)*;

AssignmentExpression:
    left=BinaryExpression (operator=AssignmentOperator right=AssignmentExpression)?;

BinaryExpression:
    left=UnaryExpression (operator=BinaryOperator right=UnaryExpression)?;

UnaryExpression:
    (operator=UnaryOperator)? expression=PostfixExpression;

PostfixExpression:
    base=PrimaryExpression (postfixes+=PostfixOperation)*;

PostfixOperation:
    {infer PostfixOperation} (CallExpression | MemberExpression | TaggedTemplateExpression | TypeAssertion | NonNullAssertion | OptionalChain | ConstAssertion);

OptionalChain:
    {infer OptionalChain} '?.' (CallExpression | MemberExpression);

TypeAssertion:
    {infer TypeAssertion} 'as' type=Type | {infer AngleBracketTypeAssertion} '<' type=Type '>';

NonNullAssertion:
    {infer NonNullAssertion} '!';

ConstAssertion:
    {infer ConstAssertion} 'as' 'const';

Literal:
    StringLiteral
    | NumberLiteral
    | BooleanLiteral
    | NullLiteral
    | UndefinedLiteral
    | RegExpLiteral
    | Identifier
    | TemplateLiteral;

PrimaryExpression:
    Literal
    | ArrayLiteral
    | ObjectLiteral
    | ParenthesizedExpression
    | ArgumentsExpression
    | ArrowFunctionExpression
    | AsyncArrowFunctionExpression
    | FunctionExpression
    | AsyncFunctionExpression
    | YieldExpression
    | AwaitExpression
    | SpreadExpression
    | NewExpression
    | SuperExpression
    | MetaPropertyExpression;

// =============================================
// Types
// =============================================
Type:
    UnionType;

UnionType:
    types+=IntersectionType ('|' types+=IntersectionType)*;

IntersectionType:
    types+=PostfixType ('&' types+=PostfixType)*;

PostfixType:
    base=PrimaryType (postfixes+=TypePostfix)*;

TypePostfix:
    '[' indexType=Type ']' | '[]';

PrimaryType:
    StringType
    | NumberType
    | BooleanType
    | AnyType
    | VoidType
    | NullType
    | UndefinedType
    | NeverType
    | UnknownType
    | SymbolType
    | BigIntType
    | UniqueSymbolType
    | ThisType
    | LiteralType
    | TypeReference
    | FunctionType
    | GenericType
    | TemplateLiteralType
    | MappedType
    | ParenthesizedType
    | TupleType
    | InferType
    | ImportType
    | TypeQuery
    | TypeOperator;

LiteralType:
    value=StringLiteral | value=NumberLiteral | value=BooleanLiteral;

TypeReference:
    name=ID;

FunctionType:
    '(' parameters+=ParameterType (',' parameters+=ParameterType)* ')' '=>' returnType=Type;

GenericType:
    type=TypeReference '<' typeArguments+=Type (',' typeArguments+=Type)* '>';

TemplateLiteralType:
    '`' parts+=TemplateLiteralTypePart* '`';

TemplateLiteralTypePart:
    text=STRING |
    '${' expression=Type '}';

MappedType:
    '{' modifiers+=TypeModifier* '[' key=ID 'in' keyof=Type (keyRemap=KeyRemap)? ']' ':' value=Type '}';

TypeModifier:
    {infer TypeModifier} ('+' | '-' | 'readonly' | '?');

KeyRemap:
    'as' remapType=Type;

ParameterType:
    name=ID? typeAnnotation=TypeAnnotation (constraint=TypeConstraint)? (defaultValue=DefaultTypeParameter)? |
    'const' name=ID typeAnnotation=TypeAnnotation;

TypeConstraint:
    'extends' type=Type |
    'extends' 'infer' name=ID;

DefaultTypeParameter:
    '=' type=Type;

TypeAnnotation:
    ':' type=Type;

Parameter:
    name=ID typeAnnotation=TypeAnnotation? |
    pattern=DestructuringPattern typeAnnotation=TypeAnnotation? |
    TypePredicate;

TypePredicate:
    parameter=ID 'is' type=Type;

ParenthesizedType:
    '(' type=Type ')';

TupleType:
    ('readonly')? '[' elements+=TupleElement (',' elements+=TupleElement)* ']';

TupleElement:
    ('readonly')? ('...')? type=Type ('?'?);

InferType:
    'infer' name=ID;

ImportType:
    'import' '(' argument=StringLiteral ')';

TypeQuery:
    'typeof' expression=Expression |
    'keyof' type=Type;

TypeOperator:
    {infer TypeOperator} ('+' | '-') ('readonly' | '?') type=Type;

AssertsReturnType:
    'asserts' (parameter=ID ('is' type=Type)?);

IndexSignature:
    '[' key=ID ':' keyType=Type ']' ':' valueType=Type;

CallSignature:
    '(' parameters+=Parameter (',' parameters+=Parameter)* ')' returnType=TypeAnnotation?;

// =============================================
// Operators
// =============================================
BinaryOperator returns string:
    '+' | '-' | '*' | '/' | '%' | '**' | '==' | '===' | '!=' | '!==' |
    '<' | '<=' | '>' | '>=' | '&&' | '||' | '??' | '|' | '&' | '^' | '<<' | '>>' | '>>>' |
    'instanceof' | 'in';

UnaryOperator returns string:
    '+' | '-' | '!' | '~' | 'typeof' | 'void' | 'delete';

AssignmentOperator returns string:
    '=' | '+=' | '-=' | '*=' | '/=' | '%=' | '**=' | '<<=' | '>>=' | '>>>=' | '&=' | '^=' | '|=';

Modifier returns string:
    'public' | 'private' | 'protected' | 'static' | 'readonly' | 'abstract' | 'declare' | 'override';

// =============================================
// Terminals
// =============================================
terminal STRING:
    /"([^"\\]|\\.)*"/ | /'([^'\\]|\\.)*'/;

terminal NUMBER:
    /[0-9]+(\.[0-9]+)?/ |  // Decimal
    /0[bB][01]+/ |         // Binary
    /0[oO][0-7]+/ |        // Octal
    /0[xX][0-9a-fA-F]+/;   // Hex

terminal BIGINT:
    /[0-9]+n/ |            // Decimal BigInt
    /0[bB][01]+n/ |        // Binary BigInt
    /0[oO][0-7]+n/ |       // Octal BigInt
    /0[xX][0-9a-fA-F]+n/;  // Hex BigInt

terminal REGEXP:
    /\/([^\/\\]|\\.)*\/[gimuy]*/;

terminal ID:
    /[a-zA-Z_$][a-zA-Z0-9_$]*/;

hidden terminal ML_COMMENT:
    /\/\*[\s\S]*?\*\//;

hidden terminal SL_COMMENT:
    /\/\/[^\n\r]*/;

hidden terminal WS:
    /\s+/;
StringType:
    {infer StringType} 'string';
NumberType:
    {infer NumberType} 'number';
BooleanType:
    {infer BooleanType} 'boolean';
AnyType:
    {infer AnyType} 'any';
VoidType:
    {infer VoidType} 'void';
NullType:
    {infer NullType} 'null';
UndefinedType:
    {infer UndefinedType} 'undefined';
NeverType:
    {infer NeverType} 'never';
UnknownType:
    {infer UnknownType} 'unknown';
SymbolType:
    {infer SymbolType} 'symbol';
BigIntType:
    {infer BigIntType} 'bigint';
UniqueSymbolType:
    {infer UniqueSymbolType} 'unique' 'symbol';
ThisType:
    {infer ThisType} 'this';

StringLiteral:
    {infer StringLiteral} value=STRING;

NumberLiteral:
    {infer NumberLiteral} value=(NUMBER | BIGINT);

BooleanLiteral:
    {infer BooleanLiteral} value=('true' | 'false');

NullLiteral:
    {infer NullLiteral} value='null';

UndefinedLiteral:
    {infer UndefinedLiteral} value='undefined';

RegExpLiteral:
    {infer RegExpLiteral} value=REGEXP;

Identifier:
    {infer Identifier} name=ID;

ArrayLiteral:
    {infer ArrayLiteral} '[' elements+=Expression? (',' elements+=Expression?)* ']' |
    {infer ArrayLiteral} '[' elements+=SpreadElement? (',' elements+=SpreadElement?)* ']';

SpreadElement:
    {infer SpreadElement} '...' expression=Expression;

ObjectLiteral:
    {infer ObjectLiteral} '{' properties+=PropertyAssignment (',' properties+=PropertyAssignment)* '}' |
    {infer ObjectLiteral} '{' properties+=SpreadProperty? (',' properties+=SpreadProperty?)* '}' |
    {infer ObjectLiteral} '{' indexSignature=IndexSignature (',' properties+=PropertyAssignment)* '}' |
    {infer ObjectLiteral} '{' callSignature=CallSignature (',' properties+=PropertyAssignment)* '}';

SpreadProperty:
    {infer SpreadProperty} '...' expression=Expression;

PropertyAssignment:
    {infer PropertyAssignment} name=PropertyName ':' value=Expression |
    {infer PropertyAssignment} name=ID |
    {infer PropertyAssignment} '[' expression=Expression ']' ':' value=Expression;

PropertyName:
    {infer PropertyName} (Identifier | StringLiteral | NumberLiteral);

ParenthesizedExpression:
    {infer ParenthesizedExpression} '(' expression=Expression ')';

TemplateLiteral:
    {infer TemplateLiteral} '`' parts+=TemplatePart* '`';

TemplatePart:
    {infer TemplatePart} text=STRING | expression=Expression;

ArgumentsExpression:
    {infer ArgumentsExpression} 'arguments';

ArrowFunctionExpression:
    {infer ArrowFunctionExpression} parameters+=Parameter (',' parameters+=Parameter)* '=>' (body=Block | body=Expression);

AsyncArrowFunctionExpression:
    {infer AsyncArrowFunctionExpression} 'async' parameters+=Parameter (',' parameters+=Parameter)* '=>' (body=Block | body=Expression);

FunctionExpression:
    {infer FunctionExpression} 'function' name=ID? '(' parameters+=Parameter (',' parameters+=Parameter)* ')' 
    returnType=TypeAnnotation? body=Block;

AsyncFunctionExpression:
    {infer AsyncFunctionExpression} 'async' 'function' name=ID? '(' parameters+=Parameter (',' parameters+=Parameter)* ')' 
    returnType=TypeAnnotation? body=Block;

YieldExpression:
    {infer YieldExpression} 'yield' expression=Expression? |
    {infer YieldExpression} 'yield' '*' expression=Expression;

AwaitExpression:
    {infer AwaitExpression} 'await' expression=Expression;

SpreadExpression:
    {infer SpreadExpression} '...' expression=Expression;

NewExpression:
    {infer NewExpression} 'new' callee=Expression arguments=Arguments?;

Arguments:
    {infer Arguments} '(' arguments+=Expression? (',' arguments+=Expression?)* ')' |
    {infer Arguments} '(' arguments+=SpreadElement? (',' arguments+=SpreadElement?)* ')';

SuperExpression:
    {infer SuperExpression} 'super';

MetaPropertyExpression:
    {infer MetaPropertyExpression} 'new' '.' 'target';

CallExpression:
    {infer CallExpression} '(' arguments+=Expression? (',' arguments+=Expression?)* ')' |
    {infer CallExpression} '(' arguments+=SpreadElement? (',' arguments+=SpreadElement?)* ')';

MemberExpression:
    {infer MemberExpression} '.' property=Identifier |
    {infer MemberExpression} '[' property=Expression ']';

TaggedTemplateExpression:
    {infer TaggedTemplateExpression} template=TemplateLiteral;

