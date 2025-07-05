import type { Identifier, TypeParameter } from "./AST.ts";
import type { Span } from "./Span.ts";

export type Type =
	| AnyType
	| ArrayType
	| FloatLiteralType
	| FloatType
	| FunctionType
	| IntegerLiteralType
	| IntegerType
	| IntersectionType
	| NeverType
	| RecordType
	| StringLiteralType
	| StringType
	| TaggedUnionType
	| TupleType
	| TypeHole
	| TypeReference;

export class IntegerType {
	readonly kind = "IntegerType";
	constructor(readonly span: Span) {}

	toString(): string {
		return "Int";
	}
}

export class IntegerLiteralType {
	readonly kind = "IntegerLiteralType";
	constructor(
		readonly value: number,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.value}`;
	}
}

export class FloatType {
	readonly kind = "FloatType";
	constructor(readonly span: Span) {}

	toString(): string {
		return "Float";
	}
}

export class FloatLiteralType {
	readonly kind = "FloatLiteralType";
	constructor(
		readonly value: number,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.value}`;
	}
}

export class StringType {
	readonly kind = "StringType";
	constructor(readonly span: Span) {}

	toString(): string {
		return "String";
	}
}

export class StringLiteralType {
	readonly kind = "StringLiteralType";
	constructor(
		readonly value: string,
		readonly span: Span,
	) {}

	toString(): string {
		return `"${this.value}"`;
	}
}

export class RecordType {
	readonly kind = "RecordType";
	constructor(
		readonly fields: readonly RecordFieldType[],
		readonly span: Span,
	) {}

	toString(): string {
		return `{ ${this.fields.map((f) => f.toString()).join(", ")} }`;
	}
}

export class RecordFieldType {
	readonly kind = "RecordFieldType";
	constructor(
		readonly name: Identifier,
		readonly type: Type,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}: ${this.type}`;
	}
}

export class ArrayType {
	readonly kind = "ArrayType";
	constructor(
		readonly elementType: Type,
		readonly span: Span,
	) {}

	toString(): string {
		return `Array<${this.elementType}>`;
	}
}

export class TupleType {
	readonly kind = "TupleType";
	constructor(
		readonly elements: readonly Type[],
		readonly span: Span,
	) {}

	toString(): string {
		return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
	}
}

export class FunctionType {
	readonly kind = "FunctionType";
	constructor(
		readonly typeParameters: readonly TypeParameter[],
		readonly parameters: readonly FunctionParameterType[],
		readonly returnType: Type | null,
		readonly span: Span,
	) {}

	toString(): string {
		return `${printTypeParameters(this.typeParameters)}(${printFunctionParameters(
			this.parameters,
		)}) => ${this.returnType}`;
	}
}

export class FunctionParameterType {
	readonly kind = "FunctionParameterType";
	constructor(
		readonly type: Type,
		readonly name: Identifier | null,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name ? `${this.name}: ` : ""}${this.type}`;
	}
}

export class TaggedUnionType {
	readonly kind = "TaggedUnionType";
	constructor(
		readonly name: Identifier,
		readonly typeParameters: readonly TypeParameter[],
		readonly types: readonly TaggedType[],
		readonly span: Span,
	) {}

	toString(): string {
		return `data ${this.name}${printTypeParameters(this.typeParameters)} ${this.types
			.map((t) => t.toString())
			.join(" | ")}`;
	}
}

export type TaggedType =
	| VoidConstructorType
	| TupleConstructorType
	| RecordConstructorType;

export class VoidConstructorType {
	readonly kind = "VoidConstructorType";
	constructor(
		readonly name: Identifier,
		readonly span: Span,
	) {}

	toString(): string {
		return this.name.toString();
	}
}

export class TupleConstructorType {
	readonly kind = "TupleConstructorType";
	constructor(
		readonly name: Identifier,
		readonly elements: ReadonlyArray<Type | RecordFieldType>,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}(${this.elements.map((e) => e.toString()).join(", ")})`;
	}
}

export class RecordConstructorType {
	readonly kind = "RecordConstructorType";
	constructor(
		readonly name: Identifier,
		readonly fields: readonly RecordFieldType[],
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}{ ${this.fields.map((f) => f.toString()).join(", ")} }`;
	}
}

export class IntersectionType {
	readonly kind = "IntersectionType";
	constructor(
		readonly types: readonly Type[],
		readonly span: Span,
	) {}

	toString(): string {
		return `(${this.types.map((t) => t.toString()).join(" & ")})`;
	}
}

// Bottom type
export class NeverType {
	readonly kind = "NeverType";
	constructor(readonly span: Span) {}

	toString(): string {
		return "!";
	}
}

// Top type
export class AnyType {
	readonly kind = "AnyType";
	constructor(readonly span: Span) {}

	toString(): string {
		return "Any";
	}
}

export class TypeReference {
	readonly kind = "TypeReference";
	constructor(
		readonly name: Identifier,
		readonly typeArguments: ReadonlyArray<Type | TypeHole>,
		readonly variance: Variance | null,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.name}${printTypeArguments(this.typeArguments)}${printVariance(
			this.variance,
		)}`;
	}
}

export enum Variance {
	Invariant = "invariant",
	Covariant = "covariant",
	Contravariant = "contravariant",
  // TODO: Should we bother with bivariance and phantom types?
}

export class TypeHole {
	readonly kind = "TypeHole";
	constructor(
		readonly variance: Variance | null,
		readonly span: Span,
	) {}

	toString(): string {
		return `_${printVariance(this.variance)}`;
	}
}

function printTypeParameters(typeParameters: readonly TypeParameter[]): string {
	return typeParameters.length > 0
		? `<${typeParameters.map((p) => p.toString()).join(", ")}>`
		: "";
}

function printFunctionParameters(
	parameters: readonly FunctionParameterType[],
): string {
	return parameters.map((p) => p.toString()).join(", ");
}

function printTypeArguments(
	typeArguments: ReadonlyArray<Type | TypeHole>,
): string {
	if (typeArguments.length === 0) {
		return "";
	}

	return `<${typeArguments.map((t) => t.toString()).join(", ")}>`;
}

function printVariance(variance: Variance | null): string {
	if (variance === null) {
		return "";
	}

	switch (variance) {
		case Variance.Covariant:
			return "+";
		case Variance.Contravariant:
			return "-";
		case Variance.Invariant:
			return "~";
	}
}
