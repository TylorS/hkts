/**
 * Type Variables and Constraints System
 *
 * This module provides the foundation for type inference and constraint solving
 * in a higher-kinded type system with subtyping, variance annotations, and row types.
 *
 * The constraint system supports:
 * - Type inference and unification
 * - Subtyping with variance checking
 * - Higher-kinded type application
 * - Bounded polymorphism
 * - Row types for effects and records
 * - Existential types for local inference
 */

import type { Span } from "../parse/Span.ts";
import type * as Type from "../parse/Type.ts";

/**
 * Kind representation for higher-kinded types
 */
export type Kind = BaseKind | TypeConstructorKind;

/**
 * Base kind for ground types (Int, String, etc.)
 */
export interface BaseKind {
	readonly kind: "BaseKind";
}

/**
 * Type constructor kind for higher-kinded types (List, Map, etc.)
 */
export interface TypeConstructorKind {
	readonly kind: "TypeConstructorKind";
	readonly arity: number;
	readonly params: readonly Kind[];
}

/**
 * A type variable represents an unknown type that will be inferred.
 * Each type variable has a unique ID and optional variance annotation.
 */
export class TypeVariable {
	readonly kind = "TypeVariable";

	private _solution: Type.Type | null = null;
	private _constraints: Constraint[] = [];

	constructor(
		readonly id: number,
		readonly variance: Type.Variance | null,
		readonly span: Span,
	) {}

	get solution(): Type.Type | null {
		return this._solution;
	}

	set solution(value: Type.Type | null) {
		this._solution = value;
	}

	get constraints(): readonly Constraint[] {
		return this._constraints;
	}

	addConstraint(constraint: Constraint): void {
		this._constraints.push(constraint);
	}

	clearConstraints(): void {
		this._constraints = [];
	}

	toString(): string {
		if (this._solution) {
			return `α${this.id} == ${this._solution}`;
		}
		return `α${this.id}`;
	}
}

/**
 * Base constraint type
 */
export interface BaseConstraint {
	readonly kind: string;
	readonly span: Span;
}

/**
 * Equality constraint: A = B
 */
export interface EqualityConstraint extends BaseConstraint {
	readonly kind: "EqualityConstraint";
	readonly left: Type.Type | TypeVariable;
	readonly right: Type.Type | TypeVariable;
}

/**
 * Subtype constraint: A ≤ B
 */
export interface SubtypeConstraint extends BaseConstraint {
	readonly kind: "SubtypeConstraint";
	readonly left: Type.Type | TypeVariable;
	readonly right: Type.Type | TypeVariable;
}

/**
 * Type application constraint: F[A] = B
 */
export interface TypeApplicationConstraint extends BaseConstraint {
	readonly kind: "TypeApplicationConstraint";
	readonly typeConstructor: Type.Type | TypeVariable;
	readonly argument: Type.Type | TypeVariable;
	readonly result: Type.Type | TypeVariable;
}

/**
 * Well-formedness constraint: T : Bound
 */
export interface WellFormednessConstraint extends BaseConstraint {
	readonly kind: "WellFormednessConstraint";
	readonly type: Type.Type | TypeVariable;
	readonly bounds: readonly Type.Type[];
}

/**
 * Variance constraint: T : variance
 */
export interface VarianceConstraint extends BaseConstraint {
	readonly kind: "VarianceConstraint";
	readonly type: Type.Type | TypeVariable;
	readonly variance: Type.Variance;
}

/**
 * Kind constraint: T :: kind
 */
export interface KindConstraint extends BaseConstraint {
	readonly kind: "KindConstraint";
	readonly type: Type.Type | TypeVariable;
	readonly expectedKind: Kind;
}

/**
 * Existential constraint: ∃α. C
 */
export interface ExistentialConstraint extends BaseConstraint {
	readonly kind: "ExistentialConstraint";
	readonly typeVariable: TypeVariable;
	readonly innerConstraint: Constraint;
}

/**
 * Row equality constraint: { a: A | r } = { a: A, b: B }
 */
export interface RowEqualityConstraint extends BaseConstraint {
	readonly kind: "RowEqualityConstraint";
	readonly left: Type.Type | TypeVariable;
	readonly right: Type.Type | TypeVariable;
}

/**
 * Row lacks constraint: r ⊥ label
 */
export interface RowLacksConstraint extends BaseConstraint {
	readonly kind: "RowLacksConstraint";
	readonly row: Type.Type | TypeVariable;
	readonly label: string;
}

/**
 * Row extension constraint: { a: A, b: B } ⊆ { a: A | r }
 */
export interface RowExtensionConstraint extends BaseConstraint {
	readonly kind: "RowExtensionConstraint";
	readonly extended: Type.Type | TypeVariable;
	readonly base: Type.Type | TypeVariable;
}

/**
 * Union of all constraint types
 */
export type Constraint = 
	| EqualityConstraint
	| SubtypeConstraint
	| TypeApplicationConstraint
	| WellFormednessConstraint
	| VarianceConstraint
	| KindConstraint
	| ExistentialConstraint
	| RowEqualityConstraint
	| RowLacksConstraint
	| RowExtensionConstraint;

/**
 * Constraint solving result ADT
 */
export type ConstraintResult = 
	| ConstraintSuccess
	| ConstraintFailure
	| ConstraintIncomplete
	| ConstraintProgress;

/**
 * All constraints successfully solved
 */
export interface ConstraintSuccess {
	readonly kind: "Success";
	readonly errors: readonly string[];
}

/**
 * Constraint constructor functions
 */
export function equalityConstraint(
	left: Type.Type | TypeVariable,
	right: Type.Type | TypeVariable,
	span: Span,
): EqualityConstraint {
	return { kind: "EqualityConstraint", left, right, span };
}

export function subtypeConstraint(
	left: Type.Type | TypeVariable,
	right: Type.Type | TypeVariable,
	span: Span,
): SubtypeConstraint {
	return { kind: "SubtypeConstraint", left, right, span };
}

export function typeApplicationConstraint(
	typeConstructor: Type.Type | TypeVariable,
	argument: Type.Type | TypeVariable,
	result: Type.Type | TypeVariable,
	span: Span,
): TypeApplicationConstraint {
	return { kind: "TypeApplicationConstraint", typeConstructor, argument, result, span };
}

export function wellFormednessConstraint(
	type: Type.Type | TypeVariable,
	bounds: readonly Type.Type[],
	span: Span,
): WellFormednessConstraint {
	return { kind: "WellFormednessConstraint", type, bounds, span };
}

export function varianceConstraint(
	type: Type.Type | TypeVariable,
	variance: Type.Variance,
	span: Span,
): VarianceConstraint {
	return { kind: "VarianceConstraint", type, variance, span };
}

export function kindConstraint(
	type: Type.Type | TypeVariable,
	expectedKind: Kind,
	span: Span,
): KindConstraint {
	return { kind: "KindConstraint", type, expectedKind, span };
}

export function existentialConstraint(
	typeVariable: TypeVariable,
	innerConstraint: Constraint,
	span: Span,
): ExistentialConstraint {
	return { kind: "ExistentialConstraint", typeVariable, innerConstraint, span };
}

export function rowEqualityConstraint(
	left: Type.Type | TypeVariable,
	right: Type.Type | TypeVariable,
	span: Span,
): RowEqualityConstraint {
	return { kind: "RowEqualityConstraint", left, right, span };
}

export function rowLacksConstraint(
	row: Type.Type | TypeVariable,
	label: string,
	span: Span,
): RowLacksConstraint {
	return { kind: "RowLacksConstraint", row, label, span };
}

export function rowExtensionConstraint(
	extended: Type.Type | TypeVariable,
	base: Type.Type | TypeVariable,
	span: Span,
): RowExtensionConstraint {
	return { kind: "RowExtensionConstraint", extended, base, span };
}

/**
 * Constraints are unsatisfiable
 */
export interface ConstraintFailure {
	readonly kind: "Failure";
	readonly errors: readonly string[];
}

/**
 * Some constraints couldn't be solved due to unresolved type variables
 */
export interface ConstraintIncomplete {
	readonly kind: "Incomplete";
	readonly unsolvedConstraints: readonly Constraint[];
	readonly errors: readonly string[];
}

/**
 * Made progress but more solving needed
 */
export interface ConstraintProgress {
	readonly kind: "Progress";
	readonly remainingConstraints: readonly Constraint[];
	readonly errors: readonly string[];
}

/**
 * Helper functions for creating constraint results
 */
export const ConstraintResults = {
	success: (errors: readonly string[] = []): ConstraintSuccess => ({
		kind: "Success",
		errors,
	}),
	
	failure: (errors: readonly string[]): ConstraintFailure => ({
		kind: "Failure",
		errors,
	}),
	
	incomplete: (unsolvedConstraints: readonly Constraint[], errors: readonly string[] = []): ConstraintIncomplete => ({
		kind: "Incomplete",
		unsolvedConstraints,
		errors,
	}),
	
	progress: (remainingConstraints: readonly Constraint[], errors: readonly string[] = []): ConstraintProgress => ({
		kind: "Progress",
		remainingConstraints,
		errors,
	}),
} as const;
