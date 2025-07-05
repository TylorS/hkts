/**
 * Type Variables and Constraints System
 *
 * This module provides the foundation for type inference and constraint solving
 * in a higher-kinded type system with subtyping and variance annotations.
 *
 * @example
 * ```typescript
 * // Example: Type inference for a higher-order function
 * //
 * // Source code:
 * // fun<T: Num>(xs: List<T>) -> T {
 * //   return xs.head()
 * // }
 *
 * // Generated constraints:
 * const T = new TypeVariable(null, span);
 * const xsType = new TypeVariable(null, span);
 * const resultType = new TypeVariable(null, span);
 *
 * // Well-formedness: T must satisfy Num constraint
 * new WellFormednessConstraint(T, [numType], span);
 *
 * // Type application: xs has type List<T>
 * new TypeApplicationConstraint(listConstructor, T, xsType, span);
 *
 * // Instance constraint: List<T> must have a head method
 * new InstanceConstraint(xsType, "HasHead", span);
 *
 * // Equality: head() returns T
 * new EqualityConstraint(headResultType, T, span);
 *
 * // Function type: fn has type (List<T> -> T)
 * new FunctionType([T], [xsParam], resultType, span);
 *
 * // Variance: T is used covariantly in return position
 * new VarianceConstraint(T, Variance.Covariant, span);
 * ```
 */

import type { Span } from "../parse/Span.ts";
import type { Type, Variance } from "../parse/Type.ts";

/**
 * A type variable represents an unknown type that will be inferred.
 * Each type variable has a unique ID and optional variance annotation.
 */
export class TypeVariable {
	readonly kind = "TypeVariable";

	private _solution: Type | null = null;
	private _constraints: Constraint[] = [];

	constructor(
		readonly id: number,
		readonly variance: Variance | null,
		readonly span: Span,
	) {}

	get solution(): Type | null {
		return this._solution;
	}

	set solution(value: Type | null) {
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

export type Constraint =
	| EqualityConstraint // e.g., `A = B`
	| ExistentialConstraint // e.g., `∃α. C`
	| InstanceConstraint // e.g., `T : C`
	| KindConstraint // e.g., `T :: *`
	| SkolemizationConstraint // e.g., `T ~> α`
	| SubtypeConstraint // e.g., `A ≤ B`
	| TypeApplicationConstraint // e.g., `F[A] = B`
	| UnificationConstraint // e.g., `A ~ B`
	| VarianceConstraint // e.g., `A : variance`
	| WellFormednessConstraint // e.g., `A : B & C`
	| RowEqualityConstraint // e.g., `{ a: A | r } = { a: A, b: B }`
	| RowLacksConstraint // e.g., `r ⊥ label`, used to ensure label absence
	| RowExtensionConstraint; // e.g., `{ a: A, b: B } ⊆ { a: A | r }`

/**
 * Subtype constraint: left ≤ right
 *
 * Represents that one type is a subtype of another.
 *
 * @example
 * ```typescript
 * // int ≤ float (integers are subtypes of floats)
 * new SubtypeConstraint(intType, floatType, span)
 *
 * // List[Int] ≤ List[Number] (covariant subtyping)
 * new SubtypeConstraint(listIntType, listNumberType, span)
 *
 * // Function<Number, Int> ≤ Function<Int, Number> (contravariant in params, covariant in return)
 * new SubtypeConstraint(fn1Type, fn2Type, span)
 *
 * // ! ≤ T (bottom type is subtype of everything)
 * new SubtypeConstraint(!, anyType, span)
 *
 * // T ≤ Any (everything is subtype of top type)
 * new SubtypeConstraint(anyType, topType, span)
 * ```
 */
export class SubtypeConstraint {
	readonly kind = "SubtypeConstraint";

	constructor(
		readonly left: Type | TypeVariable,
		readonly right: Type | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.left} ≤ ${this.right}`;
	}
}

/**
 * Equality constraint: left = right
 *
 * Represents that two types must be exactly equal.
 *
 * @example
 * ```typescript
 * // Variable assignment: let x: T = expr
 * // T = typeof(expr)
 * new EqualityConstraint(varType, exprType, span)
 *
 * // Function parameter: fn(x: T) where x is passed T
 * // paramType = argType
 * new EqualityConstraint(paramType, argType, span)
 *
 * // Return type annotation: fn(): T { return expr }
 * // T = typeof(expr)
 * new EqualityConstraint(returnType, exprType, span)
 *
 * // Type alias: type Alias = T
 * // Alias = T
 * new EqualityConstraint(aliasType, originalType, span)
 * ```
 */
export class EqualityConstraint {
	readonly kind = "EqualityConstraint";
	constructor(
		readonly left: Type | TypeVariable,
		readonly right: Type | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.left} == ${this.right}`;
	}
}

/**
 * Variance constraint: ensures type parameters respect variance annotations
 *
 * Ensures that type parameters respect their variance annotations when used in
 * contravariant or covariant positions.
 *
 * @example
 * ```typescript
 * // Covariant type parameter in covariant position
 * // List[T] where T is covariant
 * new VarianceConstraint(typeParam, Variance.Covariant, span)
 *
 * // Contravariant type parameter in contravariant position
 * // Function<T, R> where T is contravariant
 * new VarianceConstraint(paramType, Variance.Contravariant, span)
 *
 * // Invariant type parameter (default)
 * // Array[T] where T is invariant
 * new VarianceConstraint(elementType, Variance.Invariant, span)
 *
 * // Higher-kinded type with variance
 * // Option[T] where T is covariant
 * new VarianceConstraint(hktType, Variance.Covariant, span)
 * ```
 */
export class VarianceConstraint {
	readonly kind = "VarianceConstraint";
	constructor(
		readonly type: Type | TypeVariable,
		readonly variance: Variance,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.type} : ${this.variance}`;
	}
}

/**
 * Type application constraint: F[A] where F is a higher-kinded type
 *
 * This represents the application of a type constructor F to type argument A,
 * resulting in a concrete type. Essential for higher-kinded type inference.
 *
 * @example
 * ```typescript
 * // List[Int] - applying List constructor to Int argument
 * new TypeApplicationConstraint(listConstructor, intType, listIntType, span)
 *
 * // Option[String] - applying Option constructor to String argument
 * new TypeApplicationConstraint(optionConstructor, stringType, optionStringType, span)
 *
 * // Either[Error, Result] - applying Either to two type arguments
 * new TypeApplicationConstraint(eitherConstructor, errorType, eitherErrorResultType, span)
 *
 * // Map[Key, Value] - applying Map to key and value types
 * new TypeApplicationConstraint(mapConstructor, keyType, mapKeyValueType, span)
 *
 * // Higher-kinded type application: F[A] where F is unknown
 * new TypeApplicationConstraint(unknownF, typeA, resultType, span)
 *
 * // Nested application: List[Option[Int]]
 * new TypeApplicationConstraint(listConstructor, optionIntType, listOptionIntType, span)
 * ```
 */
export class TypeApplicationConstraint {
	readonly kind = "TypeApplicationConstraint";
	constructor(
		readonly typeConstructor: Type | TypeVariable, // The type constructor (e.g., List, Option)
		readonly argument: Type | TypeVariable, // The type argument (e.g., Int)
		readonly result: Type | TypeVariable, // The resulting type (e.g., List[Int])
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.typeConstructor}[${this.argument}] = ${this.result}`;
	}
}

/**
 * Instance constraint: type is an instance of a type class
 *
 * Ensures that a type implements the required methods/properties for a type class.
 * This is the foundation for ad-hoc polymorphism and type class constraints.
 *
 * @example
 * ```typescript
 * // Numeric operations: Int : Num
 * new InstanceConstraint(intType, "Num", span)
 *
 * // Functor operations: List[Int] : Functor
 * new InstanceConstraint(listIntType, "Functor", span)
 *
 * // Monad operations: Option[String] : Monad
 * new InstanceConstraint(optionStringType, "Monad", span)
 *
 * // Ord (ordering) operations: String : Ord
 * new InstanceConstraint(stringType, "Ord", span)
 *
 * // Show (string conversion) operations: Bool : Show
 * new InstanceConstraint(boolType, "Show", span)
 *
 * // Custom type class: User : Serializable
 * new InstanceConstraint(userType, "Serializable", span)
 *
 * // Higher-kinded type class: List : Functor
 * new InstanceConstraint(listConstructor, "Functor", span)
 * ```
 */
export class InstanceConstraint {
	readonly kind = "InstanceConstraint";
	constructor(
		readonly type: Type | TypeVariable,
		readonly className: string,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.type} : ${this.className}`;
	}
}

/**
 * Well-formedness constraint: ensures a type satisfies its bounds
 *
 * Ensures that a type parameter satisfies all its declared bounds/constraints.
 * This is checked when type parameters are instantiated.
 *
 * @example
 * ```typescript
 * // Type parameter with single bound: T : Num
 * new WellFormednessConstraint(typeParam, [numType], span)
 *
 * // Type parameter with multiple bounds: T : Num & Ord & Show
 * new WellFormednessConstraint(typeParam, [numType, ordType, showType], span)
 *
 * // Higher-kinded type parameter: F : Functor
 * new WellFormednessConstraint(hktParam, [functorType], span)
 *
 * // Type parameter with default: T : Num = Int
 * new WellFormednessConstraint(typeParam, [numType], span)
 *
 * // Nested bounds: T : (Num & Ord) & Show
 * new WellFormednessConstraint(typeParam, [intersectionType, showType], span)
 *
 * // Function type parameter: fn<T : Num>(x: T) -> T
 * new WellFormednessConstraint(funcTypeParam, [numType], span)
 * ```
 */
export class WellFormednessConstraint {
	readonly kind = "WellFormednessConstraint";
	constructor(
		readonly type: Type | TypeVariable,
		readonly bounds: readonly Type[],
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.type} : ${this.bounds.join(" & ")}`;
	}
}

/**
 * Unification constraint: forces two types to be equal during inference
 *
 * This is stronger than equality - it actively unifies the types by setting
 * type variables to concrete types. Used during type inference to propagate
 * type information.
 *
 * @example
 * ```typescript
 * // Type inference: let x = 42 (infer x : Int)
 * new UnificationConstraint(xType, intType, span)
 *
 * // Pattern matching: match expr with | x => ... (unify expr type with x type)
 * new UnificationConstraint(exprType, patternType, span)
 *
 * // Function application: fn(arg) (unify parameter type with argument type)
 * new UnificationConstraint(paramType, argType, span)
 *
 * // Type variable instantiation: T = Int
 * new UnificationConstraint(typeVar, concreteType, span)
 *
 * // Higher-kinded unification: F[Int] = List[Int]
 * new UnificationConstraint(hktType, concreteHktType, span)
 *
 * // Recursive unification: T = List[T]
 * new UnificationConstraint(typeVar, recursiveType, span)
 * ```
 */
export class UnificationConstraint {
	readonly kind = "UnificationConstraint";
	constructor(
		readonly left: Type | TypeVariable,
		readonly right: Type | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.left} ~ ${this.right}`;
	}
}

/**
 * Kind constraint: ensures a type has the expected kind
 *
 * Ensures that a type has the expected kind (type-level type). Essential for
 * higher-kinded type checking and preventing kind errors.
 *
 * @example
 * ```typescript
 * // Ground types: Int :: *
 * new KindConstraint(intType, "*", span)
 *
 * // Type constructors: List :: * -> *
 * new KindConstraint(listConstructor, "* -> *", span)
 *
 * // Higher-kinded types: Either :: * -> * -> *
 * new KindConstraint(eitherConstructor, "* -> * -> *", span)
 *
 * // Type parameters: T :: *
 * new KindConstraint(typeParam, "*", span)
 *
 * // Higher-kinded type parameters: F :: * -> *
 * new KindConstraint(hktParam, "* -> *", span)
 *
 * // Kind checking in type application: List[Int] :: *
 * new KindConstraint(listIntType, "*", span)
 *
 * // Nested kinds: Map[String, Int] :: *
 * new KindConstraint(mapStringIntType, "*", span)
 * ```
 */
export class KindConstraint {
	readonly kind = "KindConstraint";
	constructor(
		readonly type: Type | TypeVariable,
		readonly expectedKind: string,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.type} :: ${this.expectedKind}`;
	}
}

/**
 * Existential constraint: ∃α. C where C is a constraint
 *
 * Introduces a scoped type variable with a constraint. Used for local type
 * inference and scoped type variables that don't escape their scope.
 *
 * @example
 * ```typescript
 * // Local type inference: let x = expr in body
 * // ∃α. (typeof(expr) = α) ∧ body
 * new ExistentialConstraint(localTypeVar, exprConstraint, span)
 *
 * // Pattern matching with local types: match expr with | x => body
 * // ∃α. (typeof(expr) = α) ∧ (typeof(x) = α) ∧ body
 * new ExistentialConstraint(patternTypeVar, matchConstraint, span)
 *
 * // Anonymous functions: λx. body
 * // ∃α. (typeof(x) = α) ∧ body
 * new ExistentialConstraint(paramTypeVar, bodyConstraint, span)
 *
 * // Let bindings: let x = expr in body
 * // ∃α. (typeof(expr) = α) ∧ (typeof(x) = α) ∧ body
 * new ExistentialConstraint(bindingTypeVar, letConstraint, span)
 *
 * // Type annotations with inference: let x: T = expr
 * // ∃α. (T = α) ∧ (typeof(expr) = α)
 * new ExistentialConstraint(annotatedTypeVar, annotationConstraint, span)
 * ```
 */
export class ExistentialConstraint {
	readonly kind = "ExistentialConstraint";
	constructor(
		readonly typeVariable: TypeVariable,
		readonly innerConstraint: Constraint,
		readonly span: Span,
	) {}

	toString(): string {
		return `∃${this.typeVariable}. ${this.innerConstraint}`;
	}
}

/**
 * Skolemization constraint: introduces a fresh type variable
 *
 * Used when dealing with universal types and type abstraction. Skolemization
 * converts universal quantifiers to existential ones by introducing fresh
 * type variables that are distinct from all others.
 *
 * @example
 * ```typescript
 * // Universal type: ∀α. α -> α
 * // Skolemize to: β -> β where β is fresh
 * new SkolemizationConstraint(universalType, freshTypeVar, span)
 *
 * // Higher-kinded universal: ∀F. F[α] -> F[β]
 * // Skolemize to: γ[α] -> γ[β] where γ is fresh
 * new SkolemizationConstraint(hktUniversalType, freshHktVar, span)
 *
 * // Type class constraints: ∀α. (α : Num) => α -> α
 * // Skolemize to: β -> β where β : Num
 * new SkolemizationConstraint(constrainedUniversalType, freshConstrainedVar, span)
 *
 * // Nested universals: ∀α. ∀β. α -> β -> α
 * // Skolemize to: γ -> δ -> γ where γ, δ are fresh
 * new SkolemizationConstraint(nestedUniversalType, freshNestedVar, span)
 *
 * // Existential elimination: (∃α. α) -> Int
 * // Skolemize α to fresh variable
 * new SkolemizationConstraint(existentialType, freshExistentialVar, span)
 * ```
 */
export class SkolemizationConstraint {
	readonly kind = "SkolemizationConstraint";
	constructor(
		readonly originalType: Type | TypeVariable,
		readonly skolemType: TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.originalType} ~> ${this.skolemType}`;
	}
}

/**
 * Row equality constraint: ensures two row types are equal
 *
 * Row types represent extensible records with optional fields. This constraint
 * ensures that two row types have the same structure and field types.
 *
 * @example
 * ```typescript
 * // Simple row equality: { a: Int, b: String } = { a: Int, b: String }
 * new RowEqualityConstraint(row1, row2, span)
 *
 * // Row with tail variable: { a: Int | r } = { a: Int, b: String }
 * new RowEqualityConstraint(rowWithTail, concreteRow, span)
 *
 * // Nested rows: { user: { name: String, age: Int } } = { user: { name: String, age: Int } }
 * new RowEqualityConstraint(nestedRow1, nestedRow2, span)
 *
 * // Row with type variables: { key: K, value: V } = { key: K, value: V }
 * new RowEqualityConstraint(genericRow1, genericRow2, span)
 *
 * // Empty row equality: {} = {}
 * new RowEqualityConstraint(emptyRow1, emptyRow2, span)
 *
 * // Row with computed fields: { [K]: V } = { [K]: V }
 * new RowEqualityConstraint(computedRow1, computedRow2, span)
 * ```
 */
export class RowEqualityConstraint {
	readonly kind = "RowEqualityConstraint";
	constructor(
		readonly left: Type | TypeVariable,
		readonly right: Type | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.left} = ${this.right}`;
	}
}

/**
 * Row lacks constraint: ensures a row type does not contain a specific label
 *
 * Used to prevent field conflicts and ensure row type safety. This constraint
 * asserts that a row type (or its tail) does not contain a particular field label.
 *
 * @example
 * ```typescript
 * // Prevent field conflict: r ⊥ "name" (row r lacks field "name")
 * new RowLacksConstraint(rowType, "name", span)
 *
 * // Extend row safely: { name: String | r } where r ⊥ "name"
 * new RowLacksConstraint(tailRow, "name", span)
 *
 * // Multiple lacks: r ⊥ "x" and r ⊥ "y"
 * new RowLacksConstraint(rowType, "x", span)
 * new RowLacksConstraint(rowType, "y", span)
 *
 * // Computed field lacks: r ⊥ K where K is a type variable
 * new RowLacksConstraint(rowType, computedKey, span)
 *
 * // Nested row lacks: r ⊥ "user.name"
 * new RowLacksConstraint(rowType, "user.name", span)
 *
 * // Row lacks in type parameters: F<r> where r ⊥ "id"
 * new RowLacksConstraint(typeParamRow, "id", span)
 * ```
 */
export class RowLacksConstraint {
	readonly kind = "RowLacksConstraint";
	constructor(
		readonly row: Type | TypeVariable,
		readonly label: string | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.row} ⊥ ${this.label}`;
	}
}

/**
 * Row extension constraint: ensures one row type extends another
 *
 * Represents that one row type contains all fields of another row type,
 * possibly with additional fields. This is the foundation for row subtyping.
 *
 * @example
 * ```typescript
 * // Simple extension: { a: Int, b: String } ⊆ { a: Int | r }
 * new RowExtensionConstraint(concreteRow, rowWithTail, span)
 *
 * // Multiple extensions: { a: Int, b: String, c: Bool } ⊆ { a: Int | r }
 * new RowExtensionConstraint(extendedRow, baseRow, span)
 *
 * // Nested extension: { user: { name: String, age: Int } } ⊆ { user: { name: String } | r }
 * new RowExtensionConstraint(nestedExtendedRow, nestedBaseRow, span)
 *
 * // Computed field extension: { [K]: V, x: Int } ⊆ { [K]: V | r }
 * new RowExtensionConstraint(computedExtendedRow, computedBaseRow, span)
 *
 * // Empty row extension: {} ⊆ r (empty row extends any row)
 * new RowExtensionConstraint(emptyRow, anyRow, span)
 *
 * // Row extension with type variables: { key: K, value: V } ⊆ { key: K | r }
 * new RowExtensionConstraint(genericExtendedRow, genericBaseRow, span)
 * ```
 */
export class RowExtensionConstraint {
	readonly kind = "RowExtensionConstraint";
	constructor(
		readonly extended: Type | TypeVariable,
		readonly base: Type | TypeVariable,
		readonly span: Span,
	) {}

	toString(): string {
		return `${this.extended} ⊆ ${this.base}`;
	}
}
