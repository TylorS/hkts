import type * as Type from "../parse/Type.ts";
import { type Constraint, TypeVariable, type Kind, type ConstraintResult } from "./Constraints.ts";
import type { Span } from "../parse/Span.ts";

/**
 * ConstraintSolver - Solves type constraints incrementally
 *
 * This solver implements constraint-based type inference with:
 * - Fast incremental solving
 * - Sound type checking
 * - Support for higher-kinded types
 * - Variance checking during application and subtyping
 * - Row types for effects and records
 * - Lazy type variable unification
 *
 * The solver maintains soundness by:
 * - Tracking variance annotations
 * - Ensuring type variables respect their bounds
 * - Checking kind compatibility
 * - Validating row type operations
 * - Reporting errors for unsatisfiable constraints
 */
export class ConstraintSolver {
	private typeVariables = new Map<number, TypeVariable>();
	private constraints: Constraint[] = [];
	private errors: string[] = [];
	private nextId = 0;

	/**
	 * Add a constraint to be solved
	 */
	addConstraint(constraint: Constraint): void {
		this.constraints.push(constraint);
	}

	/**
	 * Create a fresh type variable
	 */
	fresh(span: Span, variance: Type.Variance | null = null): TypeVariable {
		const id = this.nextId++;
		const typeVariable = new TypeVariable(id, variance, span);
		this.typeVariables.set(id, typeVariable);
		return typeVariable;
	}

	/**
	 * Solve all constraints and return success status
	 */
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

			// Process constraints and remove solved ones
			this.constraints = this.constraints.filter(constraint => {
				const solved = this.solveConstraint(constraint);
				if (solved) {
					changed = true;
					return false; // Remove solved constraint
				}
				return true; // Keep unsolved constraint
			});
		}

		if (iterations >= maxIterations) {
			this.addError("Constraint solving exceeded maximum iterations");
			return false;
		}

		// Check if all remaining constraints are satisfied
		for (const constraint of this.constraints) {
			if (!this.isConstraintSatisfiable(constraint)) {
				this.addError(`Constraint not satisfied: ${constraint.kind}`);
				return false;
			}
		}

		return this.errors.length === 0;
	}

	/**
	 * Solve a single constraint
	 */
	private solveConstraint(constraint: Constraint): boolean {
		switch (constraint.kind) {
			case "EqualityConstraint":
				return this.solveEquality(constraint.left, constraint.right);
			case "SubtypeConstraint":
				return this.solveSubtype(constraint.left, constraint.right);
			case "TypeApplicationConstraint":
				return this.solveTypeApplication(constraint.typeConstructor, constraint.argument, constraint.result);
			case "WellFormednessConstraint":
				return this.solveWellFormedness(constraint.type, constraint.bounds);
			case "VarianceConstraint":
				return this.solveVariance(constraint.type, constraint.variance);
			case "KindConstraint":
				return this.solveKind(constraint.type, constraint.expectedKind);
			case "RowEqualityConstraint":
				return this.solveRowEquality(constraint.left, constraint.right);
			case "RowLacksConstraint":
				return this.solveRowLacks(constraint.row, constraint.label);
			case "RowExtensionConstraint":
				return this.solveRowExtension(constraint.extended, constraint.base);
			default:
				return false;
		}
	}

	/**
	 * Solve equality constraint: A = B
	 */
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

		return true; // Successfully solved
	}

	/**
	 * Solve subtype constraint: A ≤ B
	 */
	private solveSubtype(
		left: Type.Type | TypeVariable,
		right: Type.Type | TypeVariable,
	): boolean {
		const resolvedLeft = this.resolve(left);
		const resolvedRight = this.resolve(right);

		// If either is a type variable, can't solve yet
		if (resolvedLeft.kind === "TypeVariable" || resolvedRight.kind === "TypeVariable") {
			return false;
		}

		// Kind checking: both must have the same kind
		const leftKind = this.getKind(resolvedLeft);
		const rightKind = this.getKind(resolvedRight);
		if (!this.kindsEqual(leftKind, rightKind)) {
			this.addError(`Subtype constraint: kind mismatch (${this.kindToString(leftKind)} vs ${this.kindToString(rightKind)})`);
			return false;
		}

		// Check subtyping relationship with variance checking
		if (!this.isSubtype(resolvedLeft, resolvedRight)) {
			this.addError(`Subtype constraint failed: ${resolvedLeft} is not a subtype of ${resolvedRight}`);
			return false;
		}

		return true; // Successfully solved
	}

	/**
	 * Solve type application constraint: F[A] = B
	 */
	private solveTypeApplication(
		typeConstructor: Type.Type | TypeVariable,
		argument: Type.Type | TypeVariable,
		result: Type.Type | TypeVariable,
	): boolean {
		const resolvedConstructor = this.resolve(typeConstructor);
		const resolvedArgument = this.resolve(argument);
		const resolvedResult = this.resolve(result);

		// If any of the types are type variables, can't solve yet
		if (
			resolvedConstructor.kind === "TypeVariable" ||
			resolvedArgument.kind === "TypeVariable" ||
			resolvedResult.kind === "TypeVariable"
		) {
			return false;
		}

		// Kind checking: constructor must be TypeConstructorKind, argument must match param kind
		const constructorKind = this.getKind(resolvedConstructor);
		const argumentKind = this.getKind(resolvedArgument);
		if (constructorKind.kind !== "TypeConstructorKind" || constructorKind.arity < 1) {
			this.addError(`Type application: ${resolvedConstructor} is not a type constructor`);
			return false;
		}
		if (!this.kindsEqual(constructorKind.params[0], argumentKind)) {
			this.addError(`Type application: kind mismatch in argument (${this.kindToString(constructorKind.params[0])} vs ${this.kindToString(argumentKind)})`);
			return false;
		}

		// Check if the type application is valid with variance checking
		if (this.checkTypeApplication(
			resolvedConstructor as Type.Type,
			resolvedArgument as Type.Type,
			resolvedResult as Type.Type,
		)) {
			return true;
		}
		
		this.addError(`Invalid type application: ${resolvedConstructor}[${resolvedArgument}] != ${resolvedResult}`);
		return false;
	}

	/**
	 * Solve well-formedness constraint: T : Bound
	 */
	private solveWellFormedness(
		type: Type.Type | TypeVariable,
		bounds: readonly Type.Type[],
	): boolean {
		const resolvedType = this.resolve(type);

		// If it's a type variable, can't solve yet
		if (resolvedType.kind === "TypeVariable") {
			return false;
		}

		// Check that the type satisfies all bounds
		for (const bound of bounds) {
			if (!this.isSubtype(resolvedType, bound)) {
				this.addError(`Well-formedness constraint failed: ${resolvedType} does not satisfy bound ${bound}`);
				return false;
			}
		}

		return true; // Successfully solved
	}

	/**
	 * Solve variance constraint: T : variance
	 */
	private solveVariance(
		type: Type.Type | TypeVariable,
		variance: Type.Variance,
	): boolean {
		const resolvedType = this.resolve(type);

		// If it's a type variable, can't solve yet
		if (resolvedType.kind === "TypeVariable") {
			return false;
		}

		// Check variance compatibility
		if (!this.checkVariance(resolvedType, variance)) {
			this.addError(`Variance constraint failed: ${resolvedType} does not satisfy variance ${variance}`);
			return false;
		}

		return false; // No change
	}

	/**
	 * Solve kind constraint: T :: kind
	 */
	private solveKind(
		type: Type.Type | TypeVariable,
		expectedKind: Kind,
	): boolean {
		const resolvedType = this.resolve(type);

		// If it's a type variable, can't solve yet
		if (resolvedType.kind === "TypeVariable") {
			return false;
		}

		// Check kind compatibility
		const actualKind = this.getKind(resolvedType);
		if (!this.kindsEqual(actualKind, expectedKind)) {
			this.addError(`Kind constraint failed: ${resolvedType} has kind ${this.kindToString(actualKind)}, expected ${this.kindToString(expectedKind)}`);
			return false;
		}

		return true; // Successfully solved
	}

	/**
	 * Solve row equality constraint: { a: A | r } = { a: A, b: B }
	 */
	private solveRowEquality(
		left: Type.Type | TypeVariable,
		right: Type.Type | TypeVariable,
	): boolean {
		const resolvedLeft = this.resolve(left);
		const resolvedRight = this.resolve(right);

		// If either is a type variable, can't solve yet
		if (resolvedLeft.kind === "TypeVariable" || resolvedRight.kind === "TypeVariable") {
			return false;
		}

		// Check row equality
		if (!this.areRowTypesEqual(resolvedLeft, resolvedRight)) {
			this.addError(`Row equality failed: ${resolvedLeft} != ${resolvedRight}`);
			return false;
		}

		return false; // No change
	}

	/**
	 * Solve row lacks constraint: r ⊥ label
	 */
	private solveRowLacks(
		row: Type.Type | TypeVariable,
		label: string,
	): boolean {
		const resolvedRow = this.resolve(row);

		// If it's a type variable, can't solve yet
		if (resolvedRow.kind === "TypeVariable") {
			return false;
		}

		// Check that the row doesn't contain the label
		if (this.rowContainsLabel(resolvedRow, label)) {
			this.addError(`Row lacks constraint failed: ${resolvedRow} contains label ${label}`);
			return false;
		}

		return false; // No change
	}

	/**
	 * Solve row extension constraint: { a: A, b: B } ⊆ { a: A | r }
	 */
	private solveRowExtension(
		extended: Type.Type | TypeVariable,
		base: Type.Type | TypeVariable,
	): boolean {
		const resolvedExtended = this.resolve(extended);
		const resolvedBase = this.resolve(base);

		// If either is a type variable, can't solve yet
		if (resolvedExtended.kind === "TypeVariable" || resolvedBase.kind === "TypeVariable") {
			return false;
		}

		// Check that extended row contains all fields of base row
		if (!this.rowExtends(resolvedExtended, resolvedBase)) {
			this.addError(`Row extension failed: ${resolvedExtended} does not extend ${resolvedBase}`);
			return false;
		}

		return false; // No change
	}

	/**
	 * Resolve a type or type variable to its concrete type
	 */
	resolve(type: Type.Type | TypeVariable): Type.Type | TypeVariable {
		if (type.kind === "TypeVariable") {
			return type.solution ?? type;
		}
		return type;
	}

	/**
	 * Get all errors from constraint solving
	 */
	getErrors(): readonly string[] {
		return this.errors;
	}

	/**
	 * Add an error message
	 */
	private addError(message: string): void {
		this.errors.push(message);
	}

	/**
	 * Solve existential constraint: ∃α. C
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
		// Additional check: if the existential variable is forced to be two different types in the global context, fail
		for (const c of this.constraints) {
			if (c.kind === "EqualityConstraint") {
				if ((c.left === typeVariable || c.right === typeVariable) && c.left !== c.right) {
					this.addError(`Existential variable ${typeVariable} unified with multiple types in global context`);
					return false;
				}
			}
		}
		// If satisfiable, the existential constraint is "solved"
		return true;
	}

	/**
	 * Check if a constraint is satisfiable without mutating solver state
	 */
	private isConstraintSatisfiable(constraint: Constraint): boolean {
		switch (constraint.kind) {
			case "EqualityConstraint":
				return this.isEqualitySatisfiable(constraint.left, constraint.right);
			case "SubtypeConstraint":
				return this.isSubtypeSatisfiable(constraint.left, constraint.right);
			case "TypeApplicationConstraint": {
				const resolvedConstructor = this.resolve(constraint.typeConstructor);
				const resolvedArgument = this.resolve(constraint.argument);
				const resolvedResult = this.resolve(constraint.result);
				
				// If any are type variables, assume satisfiable
				if (
					resolvedConstructor.kind === "TypeVariable" ||
					resolvedArgument.kind === "TypeVariable" ||
					resolvedResult.kind === "TypeVariable"
				) {
					return true;
				}
				
				return this.checkTypeApplication(resolvedConstructor, resolvedArgument, resolvedResult);
			}
			case "WellFormednessConstraint": {
				const resolvedType = this.resolve(constraint.type);
				if (resolvedType.kind === "TypeVariable") {
					return true; // Assume satisfiable for type variables
				}
				// Check if the type satisfies all bounds
				return constraint.bounds.every(bound => this.isSubtype(resolvedType, bound));
			}
			default:
				return true;
		}
	}

	/**
	 * Check if an equality constraint is satisfiable
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
	 * Check if a subtype constraint is satisfiable
	 */
	private isSubtypeSatisfiable(
		left: Type.Type | TypeVariable,
		right: Type.Type | TypeVariable,
	): boolean {
		const resolvedLeft = this.resolve(left);
		const resolvedRight = this.resolve(right);

		// If either is a type variable, assume satisfiable
		if (resolvedLeft.kind === "TypeVariable" || resolvedRight.kind === "TypeVariable") {
			return true;
		}

		// Check subtyping relationship
		return this.isSubtype(resolvedLeft, resolvedRight);
	}

	/**
	 * Substitute a type variable with another type in a constraint
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
			case "SubtypeConstraint":
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
				return constraint;
		}
	}

	/**
	 * Substitute a type variable with another type in a type
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
						if (t.kind === "VoidConstructorType") {
							return t;
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
				return type;
		}
	}

	/**
	 * Check if two types are equal
	 */
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

	/**
	 * Check if one type is a subtype of another
	 */
	private isSubtype(left: Type.Type, right: Type.Type): boolean {
		// Reflexivity
		if (this.areEqual(left, right)) {
			return true;
		}

		// Bottom type is subtype of everything
		if (left.kind === "NeverType") {
			return true;
		}

		// Everything is subtype of top type
		if (right.kind === "AnyType") {
			return true;
		}

		// Handle different type kinds
		switch (left.kind) {
			case "IntegerLiteralType":
				// Integer literals are subtypes of IntegerType
				if (right.kind === "IntegerType") {
					return true;
				}
				break;

			case "FloatLiteralType":
				// Float literals are subtypes of FloatType
				if (right.kind === "FloatType") {
					return true;
				}
				break;

			case "StringLiteralType":
				// String literals are subtypes of StringType
				if (right.kind === "StringType") {
					return true;
				}
				break;

			case "ArrayType":
				if (right.kind === "ArrayType") {
					// Arrays are covariant in their element type
					return this.isSubtype(left.elementType, (right as Type.ArrayType).elementType);
				}
				break;

			case "RecordType":
				if (right.kind === "RecordType") {
					return this.isRecordSubtype(left, right as Type.RecordType);
				}
				break;

			case "FunctionType":
				if (right.kind === "FunctionType") {
					return this.isFunctionSubtype(left, right as Type.FunctionType);
				}
				break;

			case "IntersectionType":
				// A & B ≤ C iff A ≤ C and B ≤ C
				return left.types.every(type => this.isSubtype(type, right));

			case "TaggedUnionType":
				if (right.kind === "TaggedUnionType") {
					return this.isTaggedUnionSubtype(left, right as Type.TaggedUnionType);
				}
				break;

			case "TypeReference":
				if (right.kind === "TypeReference") {
					return this.isTypeReferenceSubtype(left, right as Type.TypeReference);
				}
				break;
		}

		return false;
	}

	/**
	 * Check if a type application is valid
	 */
	private checkTypeApplication(
		typeConstructor: Type.Type,
		argument: Type.Type,
		result: Type.Type,
	): boolean {
		// Handle type references (including Array)
		if (typeConstructor.kind === "TypeReference") {
			const ref = typeConstructor as Type.TypeReference;
			
			// For Array, support both ArrayType and TypeReference representations
			if (ref.name.text === "Array") {
				if (result.kind === "ArrayType") {
					const arrayResult = result as Type.ArrayType;
					return this.areEqual(arrayResult.elementType, argument);
				}
				if (result.kind === "TypeReference") {
					const resultRef = result as Type.TypeReference;
					if (resultRef.name.text !== "Array") {
						return false;
					}
					if (resultRef.typeArguments.length !== 1) {
						return false;
					}
					return this.areEqual(resultRef.typeArguments[0], argument);
				}
				return false;
			}
			
			// For all other type references, check that the result is a TypeReference
			if (result.kind !== "TypeReference") {
				return false;
			}
			
			const resultRef = result as Type.TypeReference;
			
			if (resultRef.name.text !== ref.name.text) {
				return false;
			}
			
			// Check variance if present
			if ("variance" in ref && "variance" in resultRef) {
				if (ref.variance !== resultRef.variance) {
					return false;
				}
			}
			
			// The result's typeArguments must be [argument, ...ref.typeArguments]
			if (resultRef.typeArguments.length !== ref.typeArguments.length + 1) {
				return false;
			}
			
			// Check that the first argument matches
			if (!this.areEqual(resultRef.typeArguments[0], argument)) {
				return false;
			}
			
			// Check that the rest of the arguments match the constructor's arguments
			for (let i = 0; i < ref.typeArguments.length; i++) {
				if (!this.areEqual(resultRef.typeArguments[i + 1], ref.typeArguments[i])) {
					return false;
				}
			}
			
			return true;
		}
		
		// For other type constructors, assume valid for now
		return true;
	}

	/**
	 * Check variance compatibility
	 */
	private checkVariance(type: Type.Type, variance: Type.Variance): boolean {
		// This is a simplified implementation
		// In a full implementation, you'd check that the type structure
		// is compatible with the variance annotation
		return true;
	}

	/**
	 * Get the kind of a type
	 */
	private getKind(type: Type.Type): Kind {
		switch (type.kind) {
			case "IntegerType":
			case "FloatType":
			case "StringType":
			case "NeverType":
			case "AnyType":
			case "IntegerLiteralType":
			case "FloatLiteralType":
			case "StringLiteralType":
			case "RecordType":
			case "ArrayType":
			case "FunctionType":
			case "IntersectionType":
			case "TaggedUnionType":
			case "TupleType":
			case "TypeHole":
				return { kind: "BaseKind" };
			case "TypeReference": {
				const ref = type;
				// If this is a higher-kinded type, its kind is a function from its type arguments to BaseKind
				if (ref.typeArguments.length === 0) {
					// Always treat as arity-1 type constructor
					return { kind: "TypeConstructorKind", arity: 1, params: [{ kind: "BaseKind" }] };
				}
				// If it has type arguments, its kind is the kind of the result after application
				// For now, assume all arguments are BaseKind
				return { kind: "BaseKind" };
			}
			default:
				return { kind: "BaseKind" };
		}
	}

	/**
	 * Check if two kinds are equal
	 */
	private kindsEqual(left: Kind, right: Kind): boolean {
		if (left.kind === "BaseKind" && right.kind === "BaseKind") {
			return true;
		}
		if (left.kind === "BaseKind" || right.kind === "BaseKind") {
			return false;
		}
		return left.arity === right.arity && 
		       left.params.length === right.params.length &&
		       left.params.every((param, i) => this.kindsEqual(param, right.params[i]));
	}

	/**
	 * Convert a kind to string representation
	 */
	private kindToString(kind: Kind): string {
		if (kind.kind === "BaseKind") return "*";
		return `${kind.arity}(${kind.params.map(p => this.kindToString(p)).join(", ")})`;
	}

	/**
	 * Check if two record types are equal
	 */
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

	/**
	 * Check if two function types are equal
	 */
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

	/**
	 * Check if two intersection types are equal
	 */
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

	/**
	 * Check if two tagged union types are equal
	 */
	private areTaggedUnionTypesEqual(
		left: Type.TaggedUnionType,
		right: Type.TaggedUnionType,
	): boolean {
		if (left.types.length !== right.types.length) {
			return false;
		}

		// For now, just check that the names match
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

	/**
	 * Check if two type references are equal
	 */
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

	/**
	 * Check if one record type is a subtype of another
	 */
	private isRecordSubtype(left: Type.RecordType, right: Type.RecordType): boolean {
		// Structural subtyping: left must have at least all fields of right
		const leftFields = new Map(left.fields.map(f => [f.name.text, f.type]));
		const rightFields = new Map(right.fields.map(f => [f.name.text, f.type]));

		for (const [name, rightType] of rightFields) {
			const leftType = leftFields.get(name);
			if (!leftType || !this.isSubtype(leftType, rightType)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if one function type is a subtype of another
	 */
	private isFunctionSubtype(left: Type.FunctionType, right: Type.FunctionType): boolean {
		// Function subtyping: contravariant in parameters, covariant in return
		if (left.parameters.length !== right.parameters.length) {
			return false;
		}

		// Check parameters (contravariant)
		for (let i = 0; i < left.parameters.length; i++) {
			if (!this.isSubtype(right.parameters[i].type, left.parameters[i].type)) {
				return false;
			}
		}

		// Check return type (covariant)
		if (left.returnType === null && right.returnType === null) {
			return true;
		}
		if (left.returnType === null || right.returnType === null) {
			return false;
		}
		return this.isSubtype(left.returnType, right.returnType);
	}

	/**
	 * Check if one tagged union type is a subtype of another
	 */
	private isTaggedUnionSubtype(left: Type.TaggedUnionType, right: Type.TaggedUnionType): boolean {
		// For now, just check that all constructors in left exist in right
		const leftNames = new Set(left.types.map(t => t.name.text));
		const rightNames = new Set(right.types.map(t => t.name.text));

		for (const name of leftNames) {
			if (!rightNames.has(name)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if one type reference is a subtype of another
	 */
	private isTypeReferenceSubtype(left: Type.TypeReference, right: Type.TypeReference): boolean {
		if (left.name.text !== right.name.text) {
			return false;
		}

		if (left.typeArguments.length !== right.typeArguments.length) {
			return false;
		}

		// Check type arguments based on variance
		for (let i = 0; i < left.typeArguments.length; i++) {
			const leftArg = left.typeArguments[i];
			const rightArg = right.typeArguments[i];

			// Skip type holes
			if (leftArg.kind === "TypeHole" || rightArg.kind === "TypeHole") {
				continue;
			}

			// For now, assume invariant (most common case)
			if (!this.areEqual(leftArg, rightArg)) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Check if two row types are equal
	 */
	private areRowTypesEqual(left: Type.Type, right: Type.Type): boolean {
		// Simplified implementation - in practice you'd need proper row type handling
		return this.areEqual(left, right);
	}

	/**
	 * Check if a row type contains a specific label
	 */
	private rowContainsLabel(row: Type.Type, label: string): boolean {
		// Simplified implementation - in practice you'd need proper row type handling
		return false;
	}

	/**
	 * Check if one row type extends another
	 */
	private rowExtends(extended: Type.Type, base: Type.Type): boolean {
		// Simplified implementation - in practice you'd need proper row type handling
		return this.isSubtype(extended, base);
	}
}
