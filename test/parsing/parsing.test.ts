import { beforeAll, describe, expect, it } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { createHigherKindedTypeScriptServices } from "../../src/language/hkts-module.js";
import { SourceFile, isSourceFile } from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createHigherKindedTypeScriptServices>;
let parse: ReturnType<typeof parseHelper<SourceFile>>;

beforeAll(async () => {
  services = createHigherKindedTypeScriptServices(EmptyFileSystem);
  parse = parseHelper<SourceFile>(services.HigherKindedTypeScript);

  // activate the following if your linking test requires elements from a built-in library, for example
  // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe("Parsing tests", () => {
  it("parses string literal", async () => {
    const statements = await snapshotTest(`
        "Hello, World!"
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "StringLiteral",
            "text": "Hello, World!",
          },
        },
      ]
    `);
  });

  it("parses number literal", async () => {
    const statements = await snapshotTest(`
        123
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "NumberLiteral",
            "text": "123",
          },
        },
      ]
    `);
  });

  it("parses boolean literal true", async () => {
    const statements = await snapshotTest(`
        true;
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "BooleanLiteral",
            "text": "true",
          },
        },
      ]
    `);
  });

  it("parses boolean literal false", async () => {
    const statements = await snapshotTest(`
        false;
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "BooleanLiteral",
            "text": "false",
          },
        },
      ]
    `);
  });

  it("parses array literal", async () => {
    const statements = await snapshotTest(`
        [1, 2, 3]
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "ArrayLiteral",
            "elements": [
              {
                "$type": "NumberLiteral",
                "text": "1",
              },
              {
                "$type": "NumberLiteral",
                "text": "2",
              },
              {
                "$type": "NumberLiteral",
                "text": "3",
              },
            ],
          },
        },
      ]
    `);
  });

  it("parses object literal", async () => {
    const statements = await snapshotTest(`
        { name: "John", age: 30 }
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "ObjectLiteral",
            "properties": [
              {
                "$type": "Property",
                "key": {
                  "$type": "Identifier",
                  "id": "name",
                },
                "value": {
                  "$type": "StringLiteral",
                  "text": "John",
                },
              },
              {
                "$type": "Property",
                "key": {
                  "$type": "Identifier",
                  "id": "age",
                },
                "value": {
                  "$type": "NumberLiteral",
                  "text": "30",
                },
              },
            ],
          },
        },
      ]
    `);
  });

  it("parses function declaration", async () => {
    const statements = await snapshotTest(`
        function greet(name: string): string {
            return "Hello, " + name;
        }
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "FunctionDeclaration",
          "block": {
            "$type": "Block",
            "statements": [
              {
                "$type": "ReturnStatement",
                "expression": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "StringLiteral",
                    "text": "Hello, ",
                  },
                  "operator": {
                    "$type": "AdditionOperator",
                    "text": "+",
                  },
                  "right": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                },
              },
            ],
          },
          "name": {
            "$type": "Identifier",
            "id": "greet",
          },
          "parameters": [
            {
              "$type": "ParameterDeclaration",
              "name": {
                "$type": "Identifier",
                "id": "name",
              },
              "type": {
                "$type": "PrimitiveType",
                "name": "string",
              },
            },
          ],
          "returnType": {
            "$type": "PrimitiveType",
            "name": "string",
          },
        },
      ]
    `);
  });

  describe("binary expressions", () => {
    it("parses addition", async () => {
      const statements = await snapshotTest(`
        1 + 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "AdditionOperator",
                "text": "+",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses subtraction", async () => {
      const statements = await snapshotTest(`
        1 - 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "SubtractionOperator",
                "text": "-",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses multiplication", async () => {
      const statements = await snapshotTest(`
        1 * 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "MultiplicationOperator",
                "text": "*",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses division", async () => {
      const statements = await snapshotTest(`
        1 / 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "DivisionOperator",
                "text": "/",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses equality", async () => {
      const statements = await snapshotTest(`
        1 == 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "EqualityOperator",
                "text": "==",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses inequality", async () => {
      const statements = await snapshotTest(`
        1 != 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "InequalityOperator",
                "text": "!=",
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses less than", async () => {
      const statements = await snapshotTest(`
        1 < 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "LessThanOperator",
                  "text": "<",
                },
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses greater than", async () => {
      const statements = await snapshotTest(`
        1 > 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "GreaterThanOperator",
                  "text": ">",
                },
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses less than or equal to", async () => {
      const statements = await snapshotTest(`
        1 <= 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "LessThanOrEqualOperator",
                  "text": "<=",
                },
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses greater than or equal to", async () => {
      const statements = await snapshotTest(`
        1 >= 2
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "GreaterThanOrEqualOperator",
                  "text": ">=",
                },
              },
              "right": {
                "$type": "NumberLiteral",
                "text": "2",
              },
            },
          },
        ]
      `)
    });

    it("parses multiple binary expressions", async () => {
      const statements = await snapshotTest(`
        1 + 2 * 3
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "NumberLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "AdditionOperator",
                "text": "+",
              },
              "right": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "NumberLiteral",
                  "text": "2",
                },
                "operator": {
                  "$type": "MultiplicationOperator",
                  "text": "*",
                },
                "right": {
                  "$type": "NumberLiteral",
                  "text": "3",
                },
              },
            },
          },
        ]
      `)
    });
  });

  async function snapshotTest(source: string) {
    const document = await parse(source);

    expect(checkDocumentValid(document)).toBe(undefined);

    const sourceFile = document.parseResult.value;

    return sourceFile.statements.map(recursivelyRemoveCircularReferences);
  }
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
  return (
    (document.parseResult.parserErrors.length &&
      s`
        Parser errors:
          ${document.parseResult.parserErrors
            .map((e) => e.message)
            .join("\n  ")}
    `) ||
    (document.parseResult.value === undefined &&
      `ParseResult is 'undefined'.`) ||
    (!isSourceFile(document.parseResult.value) &&
      `Root AST object is a ${document.parseResult.value.$type}, expected a '${SourceFile}'.`) ||
    undefined
  );
}

function recursivelyRemoveCircularReferences(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(recursivelyRemoveCircularReferences);
  }

  if (typeof obj === "object" && obj !== null) {
    if ("$container" in obj) {
      delete obj.$container;
    }
    if ("$containerIndex" in obj) {
      delete obj.$containerIndex;
    }
    if ("$containerProperty" in obj) {
      delete obj.$containerProperty;
    }
    if ("$cstNode" in obj) {
      delete obj.$cstNode;
    }
    if ("$document" in obj) {
      delete obj.$document;
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        recursivelyRemoveCircularReferences(value),
      ])
    );
  }

  return obj;
}
