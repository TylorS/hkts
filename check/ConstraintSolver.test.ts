import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ConstraintSolver } from "./ConstraintSolver.ts";
import { 
	equalityConstraint,
	subtypeConstraint,
	typeApplicationConstraint,
	wellFormednessConstraint,
	varianceConstraint,
	kindConstraint,
	existentialConstraint,
	rowEqualityConstraint,
	rowLacksConstraint,
	rowExtensionConstraint,
	type Kind,
	type BaseKind,
	type TypeConstructorKind
} from "./Constraints.ts";
import { Span, SpanLocation } from "../parse/Span.ts";
import * as F from '../parse/factories.ts';
import { Variance } from "../parse/Type.ts";

const DUMMY_SPAN = new Span(
	new SpanLocation(-1, -1, -1),
	new SpanLocation(-1, -1, -1),
);

// Helper functions for creating kinds
function baseKind(): BaseKind {
	return { kind: "BaseKind" };
}

function typeConstructorKind(arity: number, params: Kind[] = []): TypeConstructorKind {
	return { kind: "TypeConstructorKind", arity, params };
}

Deno.test("ConstraintSolver / Equality", async (t) => {
	await t.step("Basic types", () => {
		const solver = new ConstraintSolver();
		const tv = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		
		solver.addConstraint(equalityConstraint(tv, intType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
		assertEquals(solver.resolve(tv), intType);
	});

	await t.step("Type variables", () => {
		const solver = new ConstraintSolver();
		const tv1 = solver.fresh(DUMMY_SPAN);
		const tv2 = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		
		// tv1 = Int
		solver.addConstraint(equalityConstraint(tv1, intType, DUMMY_SPAN));
		// tv1 = tv2
		solver.addConstraint(equalityConstraint(tv1, tv2, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, true);
		assertEquals(solver.resolve(tv1), intType);
		assertEquals(solver.resolve(tv2), intType);
	});

	await t.step("Complex types", () => {
		const solver = new ConstraintSolver();
		const tv = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const arrayType = F.arrayType({ elementType: intType });
		
		solver.addConstraint(equalityConstraint(tv, arrayType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
		assertEquals(solver.resolve(tv), arrayType);
	});

	await t.step("Type mismatch error", () => {
		const solver = new ConstraintSolver();
		const intType = F.integerType({});
		const stringType = F.stringType({});
		
		solver.addConstraint(equalityConstraint(intType, stringType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});
});

Deno.test("ConstraintSolver / Subtyping", async (t) => {
	await t.step("Literal to base type", () => {
		const solver = new ConstraintSolver();
		const literalType = F.integerType({ value: 42 });
		const baseType = F.integerType({});
		
		solver.addConstraint(subtypeConstraint(literalType, baseType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Covariant arrays", () => {
		const solver = new ConstraintSolver();
		const intType = F.integerType({});
		const floatType = F.floatType({});
		const arrayInt = F.arrayType({ elementType: intType });
		const arrayFloat = F.arrayType({ elementType: floatType });
		
		// Array[Int] ≤ Array[Float] (should fail unless Int ≤ Float)
		solver.addConstraint(subtypeConstraint(arrayInt, arrayFloat, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});

	await t.step("Function subtyping", () => {
		const solver = new ConstraintSolver();
		const intType = F.integerType({});
		const floatType = F.floatType({});
		const stringType = F.stringType({});
		
		// (Float -> String) ≤ (Int -> String) (contravariant in params)
		const fn1 = F.functionType({
			parameters: [F.functionParameterType({ type: floatType, name: F.identifier({ name: "x" }) })],
			returnType: stringType
		});
		const fn2 = F.functionType({
			parameters: [F.functionParameterType({ type: intType, name: F.identifier({ name: "x" }) })],
			returnType: stringType
		});
		
		solver.addConstraint(subtypeConstraint(fn1, fn2, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});

	await t.step("Bottom and top types", () => {
		const solver = new ConstraintSolver();
		const neverType = F.neverType({});
		const anyType = F.anyType({});
		const intType = F.integerType({});
		
		// Never ≤ Int (bottom type)
		solver.addConstraint(subtypeConstraint(neverType, intType, DUMMY_SPAN));
		// Int ≤ Any (top type)
		solver.addConstraint(subtypeConstraint(intType, anyType, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, true);
	});
});

Deno.test("ConstraintSolver / TypeApplication", async (t) => {
	await t.step("Array application", () => {
		const solver = new ConstraintSolver();
		const arrayConstructor = F.typeReference({
			name: F.identifier({ name: "Array" }),
			typeArguments: []
		});
		const intType = F.integerType({});
		const arrayType = F.arrayType({ elementType: intType });
		
		solver.addConstraint(typeApplicationConstraint(arrayConstructor, intType, arrayType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Higher-kinded application", () => {
		const solver = new ConstraintSolver();
		const listConstructor = F.typeReference({
			name: F.identifier({ name: "List" }),
			typeArguments: []
		});
		const stringType = F.stringType({});
		const listString = F.typeReference({
			name: F.identifier({ name: "List" }),
			typeArguments: [stringType]
		});
		
		solver.addConstraint(typeApplicationConstraint(listConstructor, stringType, listString, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Type variables in application", () => {
		const solver = new ConstraintSolver();
		const arrayConstructor = F.typeReference({
			name: F.identifier({ name: "Array" }),
			typeArguments: []
		});
		const typeVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const arrayType = F.arrayType({ elementType: intType });
		
		// Array[α] = Array<Int> (should succeed since type variables can be unified)
		solver.addConstraint(typeApplicationConstraint(arrayConstructor, typeVar, arrayType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Application failure", () => {
		const solver = new ConstraintSolver();
		const arrayConstructor = F.typeReference({
			name: F.identifier({ name: "Array" }),
			typeArguments: []
		});
		const intType = F.integerType({});
		const stringType = F.stringType({});
		const arrayType = F.arrayType({ elementType: stringType });
		
		// Array[Int] = Array<String> (should fail - wrong element type)
		solver.addConstraint(typeApplicationConstraint(arrayConstructor, intType, arrayType, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});
});

Deno.test("ConstraintSolver / WellFormedness", async (t) => {
	await t.step("Single bound", () => {
		const solver = new ConstraintSolver();
		const tv = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const floatType = F.floatType({});
		
		// T : Int where T = Float (should fail unless Float ≤ Int)
		solver.addConstraint(wellFormednessConstraint(tv, [intType], DUMMY_SPAN));
		solver.addConstraint(equalityConstraint(tv, floatType, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});

	await t.step("Multiple bounds", () => {
		const solver = new ConstraintSolver();
		const tv = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const stringType = F.stringType({});
		const intersectionType = F.intersectionType({ types: [intType, stringType] });
		
		// T : Int & String where T = Int (should fail)
		solver.addConstraint(wellFormednessConstraint(tv, [intersectionType], DUMMY_SPAN));
		solver.addConstraint(equalityConstraint(tv, intType, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});
});

Deno.test("ConstraintSolver / Variance", async (t) => {
	await t.step("Covariant type", () => {
		const solver = new ConstraintSolver();
		const listType = F.typeReference({
			name: F.identifier({ name: "List" }),
			typeArguments: [F.integerType({})]
		});
		
		solver.addConstraint(varianceConstraint(listType, Variance.Covariant, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Contravariant type", () => {
		const solver = new ConstraintSolver();
		const functionType = F.functionType({
			parameters: [F.functionParameterType({ type: F.integerType({}), name: F.identifier({ name: "x" }) })],
			returnType: F.stringType({})
		});
		
		solver.addConstraint(varianceConstraint(functionType, Variance.Contravariant, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});
});

Deno.test("ConstraintSolver / Kind", async (t) => {
	await t.step("Base kind", () => {
		const solver = new ConstraintSolver();
		const intType = F.integerType({});
		
		solver.addConstraint(kindConstraint(intType, baseKind(), DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Type constructor kind", () => {
		const solver = new ConstraintSolver();
		const listConstructor = F.typeReference({
			name: F.identifier({ name: "List" }),
			typeArguments: []
		});
		const expectedKind = typeConstructorKind(1, [baseKind()]);
		
		solver.addConstraint(kindConstraint(listConstructor, expectedKind, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Kind mismatch", () => {
		const solver = new ConstraintSolver();
		const intType = F.integerType({});
		
		// Int :: * -> * (should fail)
		solver.addConstraint(kindConstraint(intType, typeConstructorKind(1), DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});
});

Deno.test("ConstraintSolver / Existential", async (t) => {
	await t.step("Simple existential", () => {
		const solver = new ConstraintSolver();
		const existentialVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		
		// ∃α. α = Int
		const innerConstraint = equalityConstraint(existentialVar, intType, DUMMY_SPAN);
		const exConstraint = existentialConstraint(existentialVar, innerConstraint, DUMMY_SPAN);
		
		solver.addConstraint(exConstraint);
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Existential with complex types", () => {
		const solver = new ConstraintSolver();
		const existentialVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const arrayType = F.arrayType({ elementType: intType });
		
		// ∃α. α = Array<Int>
		const innerConstraint = equalityConstraint(existentialVar, arrayType, DUMMY_SPAN);
		const exConstraint = existentialConstraint(existentialVar, innerConstraint, DUMMY_SPAN);
		
		solver.addConstraint(exConstraint);
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Existential with type mismatch", () => {
		const solver = new ConstraintSolver();
		const existentialVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const stringType = F.stringType({});
		
		// ∃α. α = Int ∧ α = String (unsatisfiable overall)
		const innerConstraint1 = equalityConstraint(existentialVar, intType, DUMMY_SPAN);
		const innerConstraint2 = equalityConstraint(existentialVar, stringType, DUMMY_SPAN);
		const exConstraint = existentialConstraint(existentialVar, innerConstraint1, DUMMY_SPAN);
		
		solver.addConstraint(exConstraint);
		solver.addConstraint(innerConstraint2);
		const success = solver.solve();
		
		assertEquals(success, false);
		assertEquals(solver.getErrors().length > 0, true);
	});
});

Deno.test("ConstraintSolver / RowTypes", async (t) => {
	await t.step("Row equality", () => {
		const solver = new ConstraintSolver();
		const row1 = F.recordType({
			fields: [
				F.recordFieldType({ name: F.identifier({ name: "x" }), type: F.integerType({}) }),
				F.recordFieldType({ name: F.identifier({ name: "y" }), type: F.stringType({}) }),
			]
		});
		const row2 = F.recordType({
			fields: [
				F.recordFieldType({ name: F.identifier({ name: "x" }), type: F.integerType({}) }),
				F.recordFieldType({ name: F.identifier({ name: "y" }), type: F.stringType({}) }),
			]
		});
		
		solver.addConstraint(rowEqualityConstraint(row1, row2, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Row lacks", () => {
		const solver = new ConstraintSolver();
		const row = F.recordType({
			fields: [
				F.recordFieldType({ name: F.identifier({ name: "x" }), type: F.integerType({}) }),
			]
		});
		
		// row ⊥ "y"
		solver.addConstraint(rowLacksConstraint(row, "y", DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});

	await t.step("Row extension", () => {
		const solver = new ConstraintSolver();
		const extended = F.recordType({
			fields: [
				F.recordFieldType({ name: F.identifier({ name: "x" }), type: F.integerType({}) }),
				F.recordFieldType({ name: F.identifier({ name: "y" }), type: F.stringType({}) }),
			]
		});
		const base = F.recordType({
			fields: [
				F.recordFieldType({ name: F.identifier({ name: "x" }), type: F.integerType({}) }),
			]
		});
		
		// extended ⊆ base
		solver.addConstraint(rowExtensionConstraint(extended, base, DUMMY_SPAN));
		const success = solver.solve();
		
		assertEquals(success, true);
	});
});

Deno.test("ConstraintSolver / Integration", async (t) => {
	await t.step("Complex type inference", () => {
		const solver = new ConstraintSolver();
		
		// Simulate: let x = 42; let y = x + 1; y
		const xVar = solver.fresh(DUMMY_SPAN);
		const yVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const intLiteral = F.integerType({ value: 42 });
		
		// x = 42
		solver.addConstraint(equalityConstraint(xVar, intLiteral, DUMMY_SPAN));
		// x : Int (well-formedness)
		solver.addConstraint(wellFormednessConstraint(xVar, [intType], DUMMY_SPAN));
		// y = x (after addition)
		solver.addConstraint(equalityConstraint(yVar, xVar, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, true);
		assertEquals(solver.resolve(xVar), intLiteral);
		assertEquals(solver.resolve(yVar), intLiteral);
	});

	await t.step("Higher-kinded type inference", () => {
		const solver = new ConstraintSolver();
		
		// Simulate: fun<F<+>>(xs: F<Int>) -> F<String>
		const fVar = solver.fresh(DUMMY_SPAN);
		const xsVar = solver.fresh(DUMMY_SPAN);
		const resultVar = solver.fresh(DUMMY_SPAN);
		const intType = F.integerType({});
		const stringType = F.stringType({});
		
		// F :: * -> *
		solver.addConstraint(kindConstraint(fVar, typeConstructorKind(1), DUMMY_SPAN));
		// F : Covariant
		solver.addConstraint(varianceConstraint(fVar, Variance.Covariant, DUMMY_SPAN));
		// xs : F[Int]
		solver.addConstraint(typeApplicationConstraint(fVar, intType, xsVar, DUMMY_SPAN));
		// result : F[String]
		solver.addConstraint(typeApplicationConstraint(fVar, stringType, resultVar, DUMMY_SPAN));
		
		const success = solver.solve();
		
		assertEquals(success, true);
	});
});
