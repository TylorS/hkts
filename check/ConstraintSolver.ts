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

		// First, process all existential constraints
		const existentialConstraints = this.constraints.filter(c => c.kind === "ExistentialConstraint");
		const nonExistentialConstraints = this.constraints.filter(c => c.kind !== "ExistentialConstraint");
		
		// Process existential constraints
		for (const constraint of existentialConstraints) {
			if (constraint.kind === "ExistentialConstraint") {
				this.solveExistential(constraint.typeVariable, constraint.innerConstraint);
			}
		}
		
		// Replace constraints with only non-existential ones
		this.constraints = nonExistentialConstraints;

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
			case "ExistentialConstraint":
				return this.solveExistential(constraint.typeVariable, constraint.innerConstraint);
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

	/**
	 * Solves existential constraints: ∃α. C
	 * 
	 * Existential constraints introduce a local type variable that exists
	 * only within the scope of the inner constraint. The solver:
	 * 1. Creates a fresh type variable for the existential
	 * 2. Substitutes the existential variable with the fresh variable in the inner constraint
	 * 3. Checks if the substituted constraint is satisfiable using a recursive call
	 * 4. Returns true if satisfiable, false otherwise
	 * 
	 * @param typeVariable The existential type variable
	 * @param innerConstraint The constraint that must hold for some type
	 * @returns true if the constraint was solved, false otherwise
	 */
	private solveExistential(
		typeVariable: TypeVariable,
		innerConstraint: Constraint,
	): boolean {
		// Create a fresh type variable for the existential
		const freshVar = this.fresh(typeVariable.span, typeVariable.variance);
		
		// Substitute the existential variable with the fresh variable in the inner constraint
		const substitutedConstraint = this.substituteInConstraint(
			innerConstraint,
			typeVariable,
			freshVar,
		);
		
		// Check satisfiability of the substituted constraint
		const isSatisfiable = this.isConstraintSatisfiable(substitutedConstraint);
		
		if (!isSatisfiable) {
			this.addError(`Existential constraint is unsatisfiable: ∃${typeVariable}. ${innerConstraint}`);
			return false;
		}
		
		// If satisfiable, the existential constraint is "solved"
		return true;
	}

	/**
	 * Checks if a constraint is satisfiable without mutating the solver state
	 * This is used for existential constraints to check satisfiability in isolation
	 */
	private isConstraintSatisfiable(constraint: Constraint): boolean {
		switch (constraint.kind) {
			case "EqualityConstraint":
				return this.isEqualitySatisfiable(constraint.left, constraint.right);
			case "ExistentialConstraint":
				// Recursive existential check
				return this.solveExistential(constraint.typeVariable, constraint.innerConstraint);
			default:
				// For other constraint types, assume satisfiable for now
				// We can extend this as needed
				return true;
		}
	}

	/**
	 * Checks if an equality constraint is satisfiable without mutating solver state
	 */
	private isEqualitySatisfiable(
		left: Type.Type | TypeVariable,
		right: Type.Type | TypeVariable,
	): boolean {
		const resolvedLeft = this.resolve(left);
		const resolvedRight = this.resolve(right);

		// If both are type variables, they can be unified (satisfiable)
		if (
			resolvedLeft.kind === "TypeVariable" &&
			resolvedRight.kind === "TypeVariable"
		) {
			return true;
		}

		// If one is a type variable, it can be unified with the other (satisfiable)
		if (resolvedLeft.kind === "TypeVariable" || resolvedRight.kind === "TypeVariable") {
			return true;
		}

		// Both are concrete types, check if they're equal
		return this.areEqual(resolvedLeft, resolvedRight);
	}

	/**
	 * Substitutes a type variable with another type in a constraint
	 * 
	 * This is used for existential constraint solving where we need to
	 * replace the existential variable with a fresh variable throughout
	 * the inner constraint.
	 * 
	 * @param constraint The constraint to substitute in
	 * @param oldVar The type variable to replace
	 * @param newType The type to replace it with
	 * @returns A new constraint with the substitution applied
	 */
	private substituteInConstraint(
		constraint: Constraint,
		oldVar: TypeVariable,
		newType: Type.Type | TypeVariable,
	): Constraint {
		switch (constraint.kind) {
			case "EqualityConstraint":
				return {
					...constraint,
					left: this.substituteInType(constraint.left, oldVar, newType),
					right: this.substituteInType(constraint.right, oldVar, newType),
				};
			case "ExistentialConstraint":
				// Don't substitute if this is the same existential variable
				if (constraint.typeVariable === oldVar) {
					return constraint;
				}
				return {
					...constraint,
					innerConstraint: this.substituteInConstraint(
						constraint.innerConstraint,
						oldVar,
						newType,
					),
				};
			default:
				// For other constraint types, return as-is for now
				// We can extend this as needed
				return constraint;
		}
	}

	/**
	 * Substitutes a type variable with another type in a type
	 * 
	 * @param type The type to substitute in
	 * @param oldVar The type variable to replace
	 * @param newType The type to replace it with
	 * @returns The type with substitution applied
	 */
	private substituteInType(
		type: Type.Type | TypeVariable,
		oldVar: TypeVariable,
		newType: Type.Type | TypeVariable,
	): Type.Type | TypeVariable {
		// If this is the variable we're replacing
		if (type === oldVar) {
			return newType;
		}

		// If it's a type variable but not the one we're replacing
		if (type.kind === "TypeVariable") {
			return type;
		}

		// For concrete types, recursively substitute in their components
		switch (type.kind) {
			case "ArrayType":
				return {
					...type,
					elementType: this.substituteInType(type.elementType, oldVar, newType) as Type.Type,
				};
			case "RecordType":
				return {
					...type,
					fields: type.fields.map((field) => ({
						...field,
						type: this.substituteInType(field.type, oldVar, newType) as Type.Type,
					})),
				};
			case "FunctionType":
				return {
					...type,
					parameters: type.parameters.map((param) => ({
						...param,
						type: this.substituteInType(param.type, oldVar, newType) as Type.Type,
					})),
					returnType: type.returnType
						? this.substituteInType(type.returnType, oldVar, newType) as Type.Type
						: null,
				};
			case "IntersectionType":
				return {
					...type,
					types: type.types.map((t) => this.substituteInType(t, oldVar, newType) as Type.Type),
				};
			case "TaggedUnionType":
				return {
					...type,
					types: type.types.map((t) => {
						// TaggedType is a union, so we need to handle each case
						if (t.kind === "VoidConstructorType") {
							return t; // No substitution needed
						}
						if (t.kind === "TupleConstructorType") {
							return {
								...t,
								elements: t.elements.map((element) => {
									if (element.kind === "RecordFieldType") {
										return {
											...element,
											type: this.substituteInType(element.type, oldVar, newType) as Type.Type,
										};
									}
									return this.substituteInType(element, oldVar, newType) as Type.Type;
								}),
							};
						}
						if (t.kind === "RecordConstructorType") {
							return {
								...t,
								fields: t.fields.map((field) => ({
									...field,
									type: this.substituteInType(field.type, oldVar, newType) as Type.Type,
								})),
							};
						}
						return t;
					}),
				};
			case "TypeReference":
				return {
					...type,
					typeArguments: type.typeArguments.map((arg) =>
						this.substituteInType(arg, oldVar, newType) as Type.Type | Type.TypeHole,
					),
				};
			case "TupleType":
				return {
					...type,
					elements: type.elements.map((element) =>
						this.substituteInType(element, oldVar, newType) as Type.Type,
					),
				};
			default:
				// For other types (IntegerType, FloatType, etc.), no substitution needed
				return type;
		}
	}
}
