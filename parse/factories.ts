import * as AST from "./AST.ts";
import { Span, SpanLocation } from "./Span.ts";
import * as Type from "./Type.ts";

const DUMMY_SPAN = new Span(
  new SpanLocation(-1, -1, -1),
  new SpanLocation(-1, -1, -1),
);

export function identifier(
  { name, span = DUMMY_SPAN }: { name: string; span?: Span },
) {
  return new AST.Identifier(name, span);
}

export function integerLiteral(
  { value, span = DUMMY_SPAN }: { value: number; span?: Span },
) {
  return new AST.IntegerLiteral(value, span);
}

export function floatLiteral(
  { value, span = DUMMY_SPAN }: { value: number; span?: Span },
) {
  return new AST.FloatLiteral(value, span);
}

export function binaryExpression(
  { left, operator, right, span = DUMMY_SPAN }: {
    left: AST.Expression;
    operator: AST.BinaryOperator;
    right: AST.Expression;
    span?: Span;
  },
) {
  return new AST.BinaryExpression(left, operator, right, span);
}

export function callExpression(
  { callee, typeArguments = [], args = [], span = DUMMY_SPAN }: {
    callee: AST.Expression;
    typeArguments?: Type.Type[];
    args?: AST.Expression[];
    span?: Span;
  },
) {
  return new AST.CallExpression(callee, typeArguments, args, span);
}

export function functionExpression(
  {
    typeParameters = [],
    parameters = [],
    body,
    exported = false,
    span = DUMMY_SPAN,
  }: {
    typeParameters?: AST.TypeParameter[];
    parameters?: AST.Identifier[];
    body: AST.Block | AST.Expression;
    exported?: boolean;
    span?: Span;
  },
) {
  return new AST.FunctionExpression(
    typeParameters,
    parameters,
    body,
    exported,
    span,
  );
}

export function block(
  { statements, span = DUMMY_SPAN }: {
    statements: AST.Statement[];
    span?: Span;
  },
) {
  return new AST.Block(statements, span);
}

export function returnStatement(
  { expression, span = DUMMY_SPAN }: {
    expression: AST.Expression;
    span?: Span;
  },
) {
  return new AST.ReturnStatement(expression, span);
}

export function expressionStatement(
  { expression, span = DUMMY_SPAN }: {
    expression: AST.Expression;
    span?: Span;
  },
) {
  return new AST.ExpressionStatement(expression, span);
}

export function variableDeclaration(
  { name, type = null, value, exported = false, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    type?: Type.Type | null;
    value: AST.Expression;
    exported?: boolean;
    span?: Span;
  },
) {
  return new AST.VariableDeclaration(name, type, value, exported, span);
}

export function functionDeclaration(
  {
    name,
    typeParameters = [],
    parameters = [],
    returnType = null,
    body,
    exported = false,
    span = DUMMY_SPAN,
  }: {
    name: AST.Identifier;
    typeParameters?: AST.TypeParameter[];
    parameters?: AST.FunctionParameter[];
    returnType?: Type.Type | null;
    body: AST.Block | AST.Expression;
    exported?: boolean;
    span?: Span;
  },
) {
  return new AST.FunctionDeclaration(
    name,
    typeParameters,
    parameters,
    returnType,
    body,
    exported,
    span,
  );
}

export function typeParameter(
  { name, constraints, defaultType = null, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    constraints: Type.Type[];
    defaultType?: Type.Type | null;
    span?: Span;
  },
) {
  return new AST.TypeParameter(name, constraints, defaultType ?? null, span);
}

export function functionParameter(
  { name, type = null, defaultValue = null, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    type?: Type.Type | null;
    defaultValue?: AST.Expression | null;
    span?: Span;
  },
) {
  return new AST.FunctionParameter(name, type, defaultValue, span);
}

export function recordLiteral(
  { fields, span = DUMMY_SPAN }: {
    fields: AST.RecordField[];
    span?: Span;
  },
) {
  return new AST.RecordLiteral(fields, span);
}

export function arrayLiteral(
  { elements, span = DUMMY_SPAN }: {
    elements: AST.Expression[];
    span?: Span;
  },
) {
  return new AST.ArrayLiteral(elements, span);
}

export function recordField(
  { name, value, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    value: AST.Expression;
    span?: Span;
  },
) {
  return new AST.RecordField(name, value, span);
}

export function ifStatement(
  { condition, then, cases, span = DUMMY_SPAN }: {
    condition: AST.Expression;
    then: AST.Block | AST.Expression;
    cases: AST.IfCase[];
    span?: Span;
  },
) {
  return new AST.IfStatement(condition, then, cases, span);
}

export function elseIfCase(
  { condition, then, span = DUMMY_SPAN }: {
    condition: AST.Expression;
    then: AST.Block | AST.Expression;
    span?: Span;
  },
) {
  return new AST.ElseIfCase(condition, then, span);
}

export function elseCase(
  { then, span = DUMMY_SPAN }: {
    then: AST.Block | AST.Expression;
    span?: Span;
  },
) {
  return new AST.ElseCase(then, span);
}

export function unaryExpression(
  { operator, operand, span = DUMMY_SPAN }: {
    operator: AST.UnaryOperator;
    operand: AST.Expression;
    span?: Span;
  },
) {
  return new AST.UnaryExpression(operator, operand, span);
}

export function typeAliasDeclaration(
  { name, typeParameters = [], type, exported = false, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    typeParameters?: AST.TypeParameter[];
    type: Type.Type;
    exported?: boolean;
    span?: Span;
  },
) {
  return new AST.TypeAliasDeclaration(
    name,
    typeParameters,
    type,
    exported,
    span,
  );
}

export function sourceFile(
  { statements, span = DUMMY_SPAN }: {
    statements: AST.Statement[];
    span?: Span;
  },
) {
  return new AST.SourceFile(statements, span);
}

export function integerType(
  { value, span = DUMMY_SPAN }: {
    value?: number;
    span?: Span;
  } = {},
) {
  if (value === undefined) {
    return new Type.IntegerType(span);
  }

  return new Type.IntegerLiteralType(value, span);
}

export function floatType(
  { value, span = DUMMY_SPAN }: {
    value?: number;
    span?: Span;
  } = {},
) {
  if (value === undefined) {
    return new Type.FloatType(span);
  }

  return new Type.FloatLiteralType(value, span);
}

export function recordType(
  { fields, span = DUMMY_SPAN }: {
    fields: readonly Type.RecordFieldType[];
    span?: Span;
  },
) {
  return new Type.RecordType(fields, span);
}

export function recordFieldType(
  { name, type, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    type: Type.Type;
    span?: Span;
  },
) {
  return new Type.RecordFieldType(name, type, span);
}

export function arrayType(
  { elementType, span = DUMMY_SPAN }: {
    elementType: Type.Type;
    span?: Span;
  },
) {
  return new Type.ArrayType(elementType, span);
}

export function tupleType(
  { elements = [], span = DUMMY_SPAN }: {
    elements: readonly Type.Type[];
    span?: Span;
  },
) {
  return new Type.TupleType(elements, span);
}

export function functionType(
  { typeParameters = [], parameters = [], returnType = null, span = DUMMY_SPAN }: {
    typeParameters?: AST.TypeParameter[];
    parameters?: Type.FunctionParameterType[];
    returnType?: Type.Type | null;
    span?: Span;
  },
) {
  return new Type.FunctionType(typeParameters, parameters, returnType, span);
}

export function functionParameterType(
  { type, name = null, span = DUMMY_SPAN }: {
    type: Type.Type;
    name?: AST.Identifier | null;
    span?: Span;
  },
) {
  return new Type.FunctionParameterType(type, name, span);
}

export function taggedUnionType(
  { name, typeParameters = [], types, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    typeParameters?: AST.TypeParameter[];
    types: readonly Type.TaggedType[];
    span?: Span;
  },
) {
  return new Type.TaggedUnionType(name, typeParameters, types, span);
}

export function voidConstructorType(
  { name, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    span?: Span;
  },
) {
  return new Type.VoidConstructorType(name, span);
}

export function tupleConstructorType(
  { name, elements, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    elements: readonly Type.Type[];
    span?: Span;
  },
) {
  return new Type.TupleConstructorType(name, elements, span);
}

export function recordConstructorType(
  { name, fields, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    fields: readonly Type.RecordFieldType[];
    span?: Span;
  },
) {
  return new Type.RecordConstructorType(name, fields, span);
}

export function intersectionType(
  { types, span = DUMMY_SPAN }: {
    types: readonly Type.Type[];
    span?: Span;
  },
) {
  return new Type.IntersectionType(types, span);
}

export function neverType(
  { span = DUMMY_SPAN }: {
    span?: Span;
  },
) {
  return new Type.NeverType(span);
}

export function anyType(
  { span = DUMMY_SPAN }: {
    span?: Span;
  },
) {
  return new Type.AnyType(span);
}

export function typeReference(
  { name, typeArguments = [], variance = null, span = DUMMY_SPAN }: {
    name: AST.Identifier;
    typeArguments?: ReadonlyArray<Type.Type | Type.TypeHole>;
    variance?: Type.Variance | null;
    span?: Span;
  },
) {
  return new Type.TypeReference(name, typeArguments, variance, span);
}

export function typeHole(
  { variance = null, span = DUMMY_SPAN }: {
    variance?: Type.Variance | null;
    span?: Span;
  },
) {
  return new Type.TypeHole(variance, span);
}

export function stringType(
  { value, span = DUMMY_SPAN }: {
    value?: string;
    span?: Span;
  },
) {
  if (value === undefined) {
    return new Type.StringType(span);
  }

  return new Type.StringLiteralType(value, span);
}
