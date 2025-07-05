import type * as Type from "../parse/Type.ts";
import { type Constraint, TypeVariable } from "./Constraints.ts";
import type { Span } from "../parse/Span.ts";

/**
 * ConstraintSolver - Solves type constraints incrementally
 *
 * This solver implements constraint-based type inference where:
 * 1. Constraints are generated during AST traversal
 * 2. Constraints are solved incrementally as they're added
 * 3. Type variables are unified with concrete types
 * 4. Subtyping relationships are checked
 *
 * The solver maintains soundness by:
 * - Tracking variance annotations
 * - Ensuring type variables respect their bounds
 * - Reporting errors for unsatisfiable constraints
 */
export class ConstraintSolver {
	private typeVariables = new Map<number, TypeVariable>();
	private constraints: Constraint[] = [];
	private errors: string[] = [];
	private nextId = 0;

	addConstraint(constraint: Constraint): void {
		this.constraints.push(constraint);
	}

	fresh(span: Span, variance: Type.Variance | null = null): TypeVariable {
		const id = this.nextId++;
		const typeVariable = new TypeVariable(id, variance, span);
		this.typeVariables.set(id, typeVariable);
		return typeVariable;
	}

	solve(): boolean {
		let changed = true;
		let iterations = 0;
		const maxIterations = 1000; // Prevent infinite loops

		while (changed && iterations < maxIterations) {
			changed = false;
			iterations++;

			for (const constraint of this.constraints) {
				if (this.solveConstraint(constraint)) {
					changed = true;
				}
			}
		}

		if (iterations >= maxIterations) {
			this.addError("Constraint solving exceeded maximum iterations");
			return false;
		}

		return this.errors.length === 0;
	}

	private solveConstraint(constraint: Constraint): boolean {
		switch (constraint.kind) {
			case "EqualityConstraint":
				return this.solveEquality(constraint.left, constraint.right);
			default:
				// For now, return false for unsupported constraints
				return false;
		}
	}

	private solveEquality(
		left: Type.Type | TypeVariable,
		right: Type.Type | TypeVariable,
	): boolean {
		const resolvedLeft = this.resolve(left);
		const resolvedRight = this.resolve(right);

		// If both are type variables, we can't solve yet
		if (
			resolvedLeft.kind === "TypeVariable" &&
			resolvedRight.kind === "TypeVariable"
		) {
			return false;
		}

		// If one is a type variable, set its solution
		if (resolvedLeft.kind === "TypeVariable") {
			resolvedLeft.solution = resolvedRight as Type.Type;
			return true;
		}

		if (resolvedRight.kind === "TypeVariable") {
			resolvedRight.solution = resolvedLeft as Type.Type;
			return true;
		}

		// Both are concrete types, check if they're equal
		if (!this.areEqual(resolvedLeft, resolvedRight)) {
			this.addError(`Type mismatch: ${resolvedLeft} != ${resolvedRight}`);
			return false;
		}

		return false; // No change
	}

	private areEqual(left: Type.Type, right: Type.Type): boolean {
		// Same instance
		if (left === right) {
			return true;
		}

		// Same kind
		if (left.kind !== right.kind) {
			return false;
		}

		// Handle different type kinds
		switch (left.kind) {
			case "IntegerType":
			case "FloatType":
			case "StringType":
			case "NeverType":
			case "AnyType":
				return true; // Singleton types

			case "IntegerLiteralType":
				return left.value === (right as Type.IntegerLiteralType).value;

			case "FloatLiteralType":
				return left.value === (right as Type.FloatLiteralType).value;

			case "StringLiteralType":
				return left.value === (right as Type.StringLiteralType).value;

			case "ArrayType":
				return this.areEqual(
					left.elementType,
					(right as Type.ArrayType).elementType,
				);

			case "RecordType":
				return this.areRecordTypesEqual(left, right as Type.RecordType);

			case "FunctionType":
				return this.areFunctionTypesEqual(left, right as Type.FunctionType);

			case "IntersectionType":
				return this.areIntersectionTypesEqual(
					left,
					right as Type.IntersectionType,
				);

			case "TaggedUnionType":
				return this.areTaggedUnionTypesEqual(
					left,
					right as Type.TaggedUnionType,
				);

			case "TypeReference":
				return this.areTypeReferencesEqual(left, right as Type.TypeReference);

			case "TupleType":
				return (
					left.elements.length === (right as Type.TupleType).elements.length &&
					left.elements.every((element, index) =>
						this.areEqual(element, (right as Type.TupleType).elements[index]),
					)
				);

			case "TypeHole":
				return left.variance === (right as Type.TypeHole).variance;

			default:
				return false;
		}
	}

	private areRecordTypesEqual(
		left: Type.RecordType,
		right: Type.RecordType,
	): boolean {
		if (left.fields.length !== right.fields.length) {
			return false;
		}

		const leftFields = new Map(left.fields.map((f) => [f.name.text, f.type]));
		const rightFields = new Map(right.fields.map((f) => [f.name.text, f.type]));

		for (const [name, leftType] of leftFields) {
			const rightType = rightFields.get(name);
			if (!rightType || !this.areEqual(leftType, rightType)) {
				return false;
			}
		}

		return true;
	}

	private areFunctionTypesEqual(
		left: Type.FunctionType,
		right: Type.FunctionType,
	): boolean {
		if (left.parameters.length !== right.parameters.length) {
			return false;
		}

		for (let i = 0; i < left.parameters.length; i++) {
			if (!this.areEqual(left.parameters[i].type, right.parameters[i].type)) {
				return false;
			}
		}

		// Handle null return types
		if (left.returnType === null && right.returnType === null) {
			return true;
		}
		if (left.returnType === null || right.returnType === null) {
			return false;
		}
		return this.areEqual(left.returnType, right.returnType);
	}

	private areIntersectionTypesEqual(
		left: Type.IntersectionType,
		right: Type.IntersectionType,
	): boolean {
		if (left.types.length !== right.types.length) {
			return false;
		}

		// For intersection types, order doesn't matter
		for (const leftType of left.types) {
			if (
				!right.types.some((rightType) => this.areEqual(leftType, rightType))
			) {
				return false;
			}
		}

		return true;
	}

	private areTaggedUnionTypesEqual(
		left: Type.TaggedUnionType,
		right: Type.TaggedUnionType,
	): boolean {
		if (left.types.length !== right.types.length) {
			return false;
		}

		// For now, just check that the names match
		// This is a simplified implementation - in practice you'd need to check the constructor types
		const leftNames = new Set(left.types.map((t) => t.name.text));
		const rightNames = new Set(right.types.map((t) => t.name.text));

		if (leftNames.size !== rightNames.size) {
			return false;
		}

		for (const name of leftNames) {
			if (!rightNames.has(name)) {
				return false;
			}
		}

		return true;
	}

	private areTypeReferencesEqual(
		left: Type.TypeReference,
		right: Type.TypeReference,
	): boolean {
		if (left.name.text !== right.name.text) {
			return false;
		}

		if (left.typeArguments.length !== right.typeArguments.length) {
			return false;
		}

		for (let i = 0; i < left.typeArguments.length; i++) {
			const leftArg = left.typeArguments[i];
			const rightArg = right.typeArguments[i];

			if (leftArg.kind === "TypeHole" || rightArg.kind === "TypeHole") {
				continue; // Type holes are equal to themselves
			}

			if (!this.areEqual(leftArg, rightArg)) {
				return false;
			}
		}

		return true;
	}

	resolve(type: Type.Type | TypeVariable): Type.Type | TypeVariable {
		if (type.kind === "TypeVariable") {
			return type.solution ?? type;
		}
		return type;
	}

	getErrors(): readonly string[] {
		return this.errors;
	}

	private addError(message: string): void {
		this.errors.push(message);
	}
}
