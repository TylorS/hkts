import type { Span } from "./Span.ts";
import type { Type } from "./Type.ts";

export type AST =
	| SourceFile
	| Statement
	| Expression
	| Declaration
	| TypeParameter
	| FunctionParameter
	| Type;

export type Expression =
	| BinaryExpression
	| UnaryExpression
	| CallExpression
	| FloatLiteral
	| FunctionExpression
	| Identifier
	| IntegerLiteral
	| RecordLiteral
	| ArrayLiteral
	| StringLiteral;

export class Identifier {
	readonly kind = "Identifier";

	constructor(
		readonly text: string,
		readonly span: Span,
	) {}

	toString(): string {
		return this.text;
	}
}

export class IntegerLiteral {
	readonly kind = "IntegerLiteral";

	constructor(
		readonly value: number,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.value}`;
	}
}

export class FloatLiteral {
	readonly kind = "FloatLiteral";

	constructor(
		readonly value: number,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.value}`;
	}
}

export class BinaryExpression {
	readonly kind = "BinaryExpression";

	constructor(
		readonly left: Expression,
		readonly operator: BinaryOperator,
		readonly right: Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.left} ${this.operator} ${this.right}`;
	}
}

export enum BinaryOperator {
	// Numeric
	Add = "+",
	Subtract = "-",
	Multiply = "*",
	Divide = "/",
	Modulo = "%",
	Exponent = "**",
	BitwiseAnd = "&",
	BitwiseOr = "|",
	BitwiseXor = "^",
	BitwiseNot = "~",
	BitwiseLeftShift = "<<",
	BitwiseRightShift = ">>",
	BitwiseUnsignedRightShift = ">>>",

	// Comparison
	Equal = "==",
	NotEqual = "!=",
	LessThan = "<",
	LessThanOrEqual = "<=",
	GreaterThan = ">",
	GreaterThanOrEqual = ">=",

	// Logical
	And = "&&",
	Or = "||",
}

export class UnaryExpression {
	readonly kind = "UnaryExpression";

	constructor(
		readonly operator: UnaryOperator,
		readonly operand: Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.operator}${this.operand}`;
	}
}

export enum UnaryOperator {
	Negate = "-",
	Not = "!",
}

export class FunctionExpression {
	readonly kind = "FunctionExpression";

	constructor(
		readonly typeParameters: readonly TypeParameter[],
		readonly parameters: readonly Identifier[],
		readonly body: Block | Expression,
		readonly exported: boolean,
		readonly span: Span,
	) {}

	toString(): string {
		let base = `(${this.parameters
			.map((p) => p.toString())
			.join(", ")}) => ${this.body}`;

		if (this.exported) {
			base = `export ${base}`;
		}

		if (this.typeParameters.length > 0) {
			return `<${this.typeParameters
				.map((p) => p.toString())
				.join(", ")}>${base}`;
		}

		return base;
	}
}

export class CallExpression {
	readonly kind = "CallExpression";

	constructor(
		readonly callee: Expression,
		readonly typeArguments: readonly Type[],
		readonly args: readonly Expression[],
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.callee.toString()}${
			this.typeArguments.length > 0
				? `<${this.typeArguments.map((t) => t.toString()).join(", ")}>`
				: ""
		}(${this.args.map((a) => a.toString()).join(", ")})`;
	}
}

export class RecordLiteral {
	readonly kind = "RecordLiteral";

	constructor(
		readonly fields: readonly RecordField[],
		readonly span: Span,
	) {}

	toString(): string {
		return `{ ${this.fields.map((f) => f.toString()).join(", ")} }`;
	}
}

export class RecordField {
	readonly kind = "RecordField";

	constructor(
		readonly name: Identifier,
		readonly value: Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}: ${this.value}`;
	}
}

export class ArrayLiteral {
	readonly kind = "ArrayLiteral";

	constructor(
		readonly elements: readonly Expression[],
		readonly span: Span,
	) {}

	toString(): string {
		return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
	}
}

export class StringLiteral {
	readonly kind = "StringLiteral";

	constructor(
		readonly value: string,
		readonly span: Span,
	) {}

	toString(): string {
		return `"${this.value}"`;
	}
}

// Statements

export type Statement =
	| Declaration
	| ExpressionStatement
	| IfStatement
	| ReturnStatement;

export class ExpressionStatement {
	readonly kind = "ExpressionStatement";

	constructor(
		readonly expression: Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return this.expression.toString();
	}
}

export class IfStatement {
	readonly kind = "IfStatement";

	constructor(
		readonly condition: Expression,
		readonly then: Block | Expression,
		readonly cases: readonly IfCase[],
		readonly span: Span,
	) {}

	toString(): string {
		return [
			`if (${this.condition}) {`,
			`  ${this.then}`,
			'}',
			...this.cases.map((c) => c.toString()),
		].join("\n");
	}
}

export type IfCase = ElseIfCase | ElseCase;

export class ElseIfCase {
	readonly kind = "ElseIfCase";

	constructor(
		readonly condition: Expression,
		readonly then: Block | Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `else if (${this.condition}) {
      ${this.then}
    }`;
	}
}

export class ElseCase {
	readonly kind = "ElseCase";

	constructor(
		readonly then: Block | Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `else {
      ${this.then}
    }`;
	}
}

export type Declaration =
	| VariableDeclaration
	| FunctionDeclaration
	| TypeAliasDeclaration;

export class VariableDeclaration {
	readonly kind = "VariableDeclaration";

	constructor(
		readonly name: Identifier,
		readonly type: Type | null,
		readonly value: Expression,
		readonly exported: boolean,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.exported ? "export " : ""}let ${this.name}${
			this.type ? `: ${this.type}` : ""
		} = ${this.value}`;
	}
}

export class FunctionDeclaration {
	readonly kind = "FunctionDeclaration";

	constructor(
		readonly name: Identifier,
		readonly typeParameters: readonly TypeParameter[],
		readonly parameters: readonly FunctionParameter[],
		readonly returnType: Type | null,
		readonly body: Block | Expression,
		readonly exported: boolean,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.exported ? "export " : ""}function ${this.name}${
			this.typeParameters.length > 0
				? `<${this.typeParameters.map((p) => p.toString()).join(", ")}>`
				: ""
		}(${this.parameters.map((p) => p.toString()).join(", ")}): ${
			this.returnType ? this.returnType.toString() : "void"
		} {
      ${this.body}
    }`;
	}
}

export class Block {
	readonly kind = "Block";
	constructor(
		readonly statements: readonly Statement[],
		readonly span: Span,
	) {}

	toString(): string {
		return `{
      ${this.statements.map((s) => s.toString()).join("\n")}
    }`;
	}
}

export class ReturnStatement {
	readonly kind = "ReturnStatement";

	constructor(
		readonly expression: Expression,
		readonly span: Span,
	) {}

	toString(): string {
		return `return ${this.expression}`;
	}
}

export class TypeAliasDeclaration {
	readonly kind = "TypeAliasDeclaration";
	constructor(
		readonly name: Identifier,
		readonly typeParameters: readonly TypeParameter[],
		readonly type: Type,
		readonly exported: boolean,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.exported ? "export " : ""}type ${this.name}${
			this.typeParameters.length > 0
				? `<${this.typeParameters.map((p) => p.toString()).join(", ")}>`
				: ""
		} = ${this.type}`;
	}
}

// Parameters

export class TypeParameter {
	readonly kind = "TypeParameter";

	constructor(
		readonly name: Identifier,
		readonly constraints: readonly Type[],
		readonly defaultType: Type | null,
		readonly span: Span,
	) {}

	toString(): string {
		let s = this.name.text;
		if (this.constraints.length > 0) {
			s += `: ${this.constraints.map((c) => c.toString()).join(" & ")}`;
		}
		if (this.defaultType) {
			s += ` = ${this.defaultType}`;
		}
		return s;
	}
}

export class FunctionParameter {
	readonly kind = "FunctionParameter";

	constructor(
		readonly name: Identifier,
		readonly type: Type | null,
		readonly defaultValue: Expression | null,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}${this.type ? `: ${this.type}` : ""}${
			this.defaultValue ? ` = ${this.defaultValue}` : ""
		}`;
	}
}

// SourceFile

export class SourceFile {
	readonly kind = "SourceFile";

	constructor(
		readonly statements: readonly Statement[],
		readonly span: Span,
	) {}

	toString(): string {
		return this.statements.map((s) => s.toString()).join("\n");
	}
}
