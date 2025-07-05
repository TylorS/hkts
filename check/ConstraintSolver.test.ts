import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { ConstraintSolver } from "./ConstraintSolver.ts";
import { EqualityConstraint } from "./Constraints.ts";
import { Span, SpanLocation } from "../parse/Span.ts";
import * as F from '../parse/factories.ts'
import { Variance } from "../parse/Type.ts";

const DUMMY_SPAN = new Span(
  new SpanLocation(-1, -1, -1),
  new SpanLocation(-1, -1, -1),
);

Deno.test("ConstraintSolver / Equality", async (t) => {
  await t.step("Integer", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    
    solver.addConstraint(new EqualityConstraint(tv, intType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), intType);
  });

  await t.step("Float", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const floatType = F.floatType({});
    
    solver.addConstraint(new EqualityConstraint(tv, floatType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), floatType);
  });

  await t.step("String", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const stringType = F.stringType({});
    
    solver.addConstraint(new EqualityConstraint(tv, stringType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), stringType);
  });

  await t.step("Array", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const arrayType = F.arrayType({ elementType: intType });
    
    solver.addConstraint(new EqualityConstraint(tv, arrayType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), arrayType);
  });

  await t.step("Record", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const recordType = F.recordType({
      fields: [
        F.recordFieldType({ name: F.identifier({ name: "x" }), type: intType }),
        F.recordFieldType({ name: F.identifier({ name: "y" }), type: stringType }),
      ]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, recordType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), recordType);
  });

  await t.step("Function", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const functionType = F.functionType({
      parameters: [
        F.functionParameterType({ type: intType, name: F.identifier({ name: "x" }) }),
      ],
      returnType: stringType
    });
    
    solver.addConstraint(new EqualityConstraint(tv, functionType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), functionType);
  });

  await t.step("Intersection", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const intersectionType = F.intersectionType({
      types: [intType, stringType]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, intersectionType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), intersectionType);
  });

  await t.step("TaggedUnion", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const taggedUnionType = F.taggedUnionType({
      name: F.identifier({ name: 'IntOrString' }),
      types: [
        F.tupleConstructorType({ name: F.identifier({ name: "Int" }), elements: [intType] }),
        F.tupleConstructorType({ name: F.identifier({ name: "String" }), elements: [stringType] }),
      ]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, taggedUnionType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), taggedUnionType);
  });

  await t.step("TypeVariable to TypeVariable", () => {
    const solver = new ConstraintSolver();
    const tv1 = solver.fresh(DUMMY_SPAN);
    const tv2 = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    
    // tv1 = int
    solver.addConstraint(new EqualityConstraint(tv1, intType, DUMMY_SPAN));
    // tv1 = tv2
    solver.addConstraint(new EqualityConstraint(tv1, tv2, DUMMY_SPAN));
    
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv1), intType);
    assertEquals(solver.resolve(tv2), intType);
  });

  await t.step("Type mismatch error", () => {
    const solver = new ConstraintSolver();
    const intType = F.integerType({});
    const stringType = F.stringType({});
    
    solver.addConstraint(new EqualityConstraint(intType, stringType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, false);
    assertEquals(solver.getErrors().length > 0, true);
  });

  await t.step("TupleType", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const tupleType = F.tupleType({
      elements: [intType, stringType]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, tupleType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), tupleType);
  });

  await t.step("TypeHole", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const typeHole = F.typeHole({ variance: Variance.Covariant });
    
    solver.addConstraint(new EqualityConstraint(tv, typeHole, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), typeHole);
  });

  await t.step("Complex nested types", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    
    // Create a complex nested type: Array<Record<{x: Int, y: String}>>
    const recordType = F.recordType({
      fields: [
        F.recordFieldType({ name: F.identifier({ name: "x" }), type: intType }),
        F.recordFieldType({ name: F.identifier({ name: "y" }), type: stringType }),
      ]
    });
    const arrayType = F.arrayType({ elementType: recordType });
    
    solver.addConstraint(new EqualityConstraint(tv, arrayType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), arrayType);
  });

  await t.step("TypeReference with type arguments", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const typeRef = F.typeReference({
      name: F.identifier({ name: "Option" }),
      typeArguments: [intType]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, typeRef, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), typeRef);
  });

  await t.step("TypeReference with variance", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const typeRef = F.typeReference({
      name: F.identifier({ name: "Ref" }),
      typeArguments: [intType],
      variance: Variance.Covariant
    });
    
    solver.addConstraint(new EqualityConstraint(tv, typeRef, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), typeRef);
  });

  await t.step("Mixed type variable assignments", () => {
    const solver = new ConstraintSolver();
    const tv1 = solver.fresh(DUMMY_SPAN);
    const tv2 = solver.fresh(DUMMY_SPAN);
    const tv3 = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    
    // tv1 = Int
    solver.addConstraint(new EqualityConstraint(tv1, intType, DUMMY_SPAN));
    // tv2 = String
    solver.addConstraint(new EqualityConstraint(tv2, stringType, DUMMY_SPAN));
    // tv3 = tv1 (should become Int)
    solver.addConstraint(new EqualityConstraint(tv3, tv1, DUMMY_SPAN));
    
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv1), intType);
    assertEquals(solver.resolve(tv2), stringType);
    assertEquals(solver.resolve(tv3), intType);
  });

  await t.step("Circular type variable references", () => {
    const solver = new ConstraintSolver();
    const tv1 = solver.fresh(DUMMY_SPAN);
    const tv2 = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    
    // tv1 = tv2
    solver.addConstraint(new EqualityConstraint(tv1, tv2, DUMMY_SPAN));
    // tv2 = Int
    solver.addConstraint(new EqualityConstraint(tv2, intType, DUMMY_SPAN));
    
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv1), intType);
    assertEquals(solver.resolve(tv2), intType);
  });

  await t.step("Function with null return type", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const functionType = F.functionType({
      parameters: [
        F.functionParameterType({ type: intType, name: F.identifier({ name: "x" }) }),
      ],
      returnType: null
    });
    
    solver.addConstraint(new EqualityConstraint(tv, functionType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), functionType);
  });

  await t.step("Tuple equality with different lengths", () => {
    const solver = new ConstraintSolver();
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const tuple1 = F.tupleType({ elements: [intType, stringType] });
    const tuple2 = F.tupleType({ elements: [intType] });
    
    solver.addConstraint(new EqualityConstraint(tuple1, tuple2, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, false);
    assertEquals(solver.getErrors().length > 0, true);
  });

  await t.step("TypeHole with different variance", () => {
    const solver = new ConstraintSolver();
    const hole1 = F.typeHole({ variance: Variance.Covariant });
    const hole2 = F.typeHole({ variance: Variance.Contravariant });
    
    solver.addConstraint(new EqualityConstraint(hole1, hole2, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, false);
    assertEquals(solver.getErrors().length > 0, true);
  });

  await t.step("Deeply nested type variables", () => {
    const solver = new ConstraintSolver();
    const tv1 = solver.fresh(DUMMY_SPAN);
    const tv2 = solver.fresh(DUMMY_SPAN);
    const tv3 = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    
    // Create a chain: tv1 = tv2 = tv3 = Int
    solver.addConstraint(new EqualityConstraint(tv1, tv2, DUMMY_SPAN));
    solver.addConstraint(new EqualityConstraint(tv2, tv3, DUMMY_SPAN));
    solver.addConstraint(new EqualityConstraint(tv3, intType, DUMMY_SPAN));
    
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv1), intType);
    assertEquals(solver.resolve(tv2), intType);
    assertEquals(solver.resolve(tv3), intType);
  });

  await t.step("Complex function type equality", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const floatType = F.floatType({});
    
    // Function: (Int, String) => Float
    const functionType = F.functionType({
      parameters: [
        F.functionParameterType({ type: intType, name: F.identifier({ name: "x" }) }),
        F.functionParameterType({ type: stringType, name: F.identifier({ name: "y" }) }),
      ],
      returnType: floatType
    });
    
    solver.addConstraint(new EqualityConstraint(tv, functionType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), functionType);
  });

  await t.step("Intersection with type variables", () => {
    const solver = new ConstraintSolver();
    const tv1 = solver.fresh(DUMMY_SPAN);
    const tv2 = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    
    // tv1 = Int & String
    const intersectionType = F.intersectionType({
      types: [intType, stringType]
    });
    solver.addConstraint(new EqualityConstraint(tv1, intersectionType, DUMMY_SPAN));
    
    // tv2 = tv1
    solver.addConstraint(new EqualityConstraint(tv2, tv1, DUMMY_SPAN));
    
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv1), intersectionType);
    assertEquals(solver.resolve(tv2), intersectionType);
  });

  await t.step("TypeReference with multiple type arguments", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const typeRef = F.typeReference({
      name: F.identifier({ name: "Map" }),
      typeArguments: [intType, stringType]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, typeRef, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), typeRef);
  });

  await t.step("Record with nested types", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    
    // Record with nested array and record types
    const nestedArray = F.arrayType({ elementType: stringType });
    const nestedRecord = F.recordType({
      fields: [
        F.recordFieldType({ name: F.identifier({ name: "nested" }), type: intType }),
      ]
    });
    
    const recordType = F.recordType({
      fields: [
        F.recordFieldType({ name: F.identifier({ name: "array" }), type: nestedArray }),
        F.recordFieldType({ name: F.identifier({ name: "record" }), type: nestedRecord }),
      ]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, recordType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), recordType);
  });

  await t.step("TypeReference with type holes", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const typeHole = F.typeHole({ variance: null });
    const typeRef = F.typeReference({
      name: F.identifier({ name: "Generic" }),
      typeArguments: [typeHole]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, typeRef, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), typeRef);
  });

  await t.step("TypeReference with nested type arguments", () => {
    const solver = new ConstraintSolver();
    const tv = solver.fresh(DUMMY_SPAN);
    const intType = F.integerType({});
    const stringType = F.stringType({});
    const optionInt = F.typeReference({
      name: F.identifier({ name: "Option" }),
      typeArguments: [intType]
    });
    const listString = F.typeReference({
      name: F.identifier({ name: "List" }),
      typeArguments: [stringType]
    });
    const mapType = F.typeReference({
      name: F.identifier({ name: "Map" }),
      typeArguments: [optionInt, listString]
    });
    
    solver.addConstraint(new EqualityConstraint(tv, mapType, DUMMY_SPAN));
    const success = solver.solve();
    
    assertEquals(success, true);
    assertEquals(solver.resolve(tv), mapType);
  });
}); 