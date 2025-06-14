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
            "$type": "IntegerLiteral",
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

  it("parses BigInt literal", async () => {
    const statements = await snapshotTest(`
        123n;
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "BigIntLiteral",
            "text": "123n",
          },
        },
      ]
    `);
  });

  it("parses BigDecimal literal", async () => {
    const statements = await snapshotTest(`
        123.45n;
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "BigDecimalLiteral",
            "text": "123.45n",
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              {
                "$type": "IntegerLiteral",
                "text": "2",
              },
              {
                "$type": "IntegerLiteral",
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
                  "$type": "IntegerLiteral",
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
        fun greet(name: String): String {
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
          "exported": false,
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
                "name": "String",
              },
            },
          ],
          "returnType": {
            "$type": "PrimitiveType",
            "name": "String",
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "AdditionOperator",
                "text": "+",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "SubtractionOperator",
                "text": "-",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "MultiplicationOperator",
                "text": "*",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "DivisionOperator",
                "text": "/",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "EqualityOperator",
                "text": "==",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "InequalityOperator",
                "text": "!=",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
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
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
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
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
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
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
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
                "$type": "IntegerLiteral",
                "text": "2",
              },
            },
          },
        ]
      `);
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
                "$type": "IntegerLiteral",
                "text": "1",
              },
              "operator": {
                "$type": "AdditionOperator",
                "text": "+",
              },
              "right": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "IntegerLiteral",
                  "text": "2",
                },
                "operator": {
                  "$type": "MultiplicationOperator",
                  "text": "*",
                },
                "right": {
                  "$type": "IntegerLiteral",
                  "text": "3",
                },
              },
            },
          },
        ]
      `);
    });
  });

  describe("if statements", () => {
    it("parses basic if statement", async () => {
      const statements = await snapshotTest(`
        if (true) {
          return 1;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "IfStatement",
            "condition": {
              "$type": "BooleanLiteral",
              "text": "true",
            },
            "elseIfs": [],
            "then": {
              "$type": "Block",
              "statements": [
                {
                  "$type": "ReturnStatement",
                  "expression": {
                    "$type": "IntegerLiteral",
                    "text": "1",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses if-else statement", async () => {
      const statements = await snapshotTest(`
        if (x > 0) {
          return "positive";
        } else {
          return "not positive";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "IfStatement",
            "condition": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "Identifier",
                "id": "x",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "GreaterThanOperator",
                  "text": ">",
                },
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "0",
              },
            },
            "else": {
              "$type": "ElseClause",
              "block": {
                "$type": "Block",
                "statements": [
                  {
                    "$type": "ReturnStatement",
                    "expression": {
                      "$type": "StringLiteral",
                      "text": "not positive",
                    },
                  },
                ],
              },
            },
            "elseIfs": [],
            "then": {
              "$type": "Block",
              "statements": [
                {
                  "$type": "ReturnStatement",
                  "expression": {
                    "$type": "StringLiteral",
                    "text": "positive",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses if-else-if statement", async () => {
      const statements = await snapshotTest(`
        if (x > 0) {
          return "positive";
        } else if (x < 0) {
          return "negative";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "IfStatement",
            "condition": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "Identifier",
                "id": "x",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "GreaterThanOperator",
                  "text": ">",
                },
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "0",
              },
            },
            "elseIfs": [
              {
                "$type": "ElseIfClause",
                "condition": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "operator": {
                    "$type": "ComparisonOperator",
                    "operator": {
                      "$type": "LessThanOperator",
                      "text": "<",
                    },
                  },
                  "right": {
                    "$type": "IntegerLiteral",
                    "text": "0",
                  },
                },
                "then": {
                  "$type": "Block",
                  "statements": [
                    {
                      "$type": "ReturnStatement",
                      "expression": {
                        "$type": "StringLiteral",
                        "text": "negative",
                      },
                    },
                  ],
                },
              },
            ],
            "then": {
              "$type": "Block",
              "statements": [
                {
                  "$type": "ReturnStatement",
                  "expression": {
                    "$type": "StringLiteral",
                    "text": "positive",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses if-else-if-else statement", async () => {
      const statements = await snapshotTest(`
        if (x > 0) {
          return "positive";
        } else if (x < 0) {
          return "negative";
        } else {
          return "zero";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "IfStatement",
            "condition": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "Identifier",
                "id": "x",
              },
              "operator": {
                "$type": "ComparisonOperator",
                "operator": {
                  "$type": "GreaterThanOperator",
                  "text": ">",
                },
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "0",
              },
            },
            "else": {
              "$type": "ElseClause",
              "block": {
                "$type": "Block",
                "statements": [
                  {
                    "$type": "ReturnStatement",
                    "expression": {
                      "$type": "StringLiteral",
                      "text": "zero",
                    },
                  },
                ],
              },
            },
            "elseIfs": [
              {
                "$type": "ElseIfClause",
                "condition": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "operator": {
                    "$type": "ComparisonOperator",
                    "operator": {
                      "$type": "LessThanOperator",
                      "text": "<",
                    },
                  },
                  "right": {
                    "$type": "IntegerLiteral",
                    "text": "0",
                  },
                },
                "then": {
                  "$type": "Block",
                  "statements": [
                    {
                      "$type": "ReturnStatement",
                      "expression": {
                        "$type": "StringLiteral",
                        "text": "negative",
                      },
                    },
                  ],
                },
              },
            ],
            "then": {
              "$type": "Block",
              "statements": [
                {
                  "$type": "ReturnStatement",
                  "expression": {
                    "$type": "StringLiteral",
                    "text": "positive",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses multiple else-if blocks", async () => {
      const statements = await snapshotTest(`
        if (x == 1) {
          return "one";
        } else if (x == 2) {
          return "two";
        } else if (x == 3) {
          return "three";
        } else {
          return "other";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "IfStatement",
            "condition": {
              "$type": "BinaryExpression",
              "left": {
                "$type": "Identifier",
                "id": "x",
              },
              "operator": {
                "$type": "EqualityOperator",
                "text": "==",
              },
              "right": {
                "$type": "IntegerLiteral",
                "text": "1",
              },
            },
            "else": {
              "$type": "ElseClause",
              "block": {
                "$type": "Block",
                "statements": [
                  {
                    "$type": "ReturnStatement",
                    "expression": {
                      "$type": "StringLiteral",
                      "text": "other",
                    },
                  },
                ],
              },
            },
            "elseIfs": [
              {
                "$type": "ElseIfClause",
                "condition": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "operator": {
                    "$type": "EqualityOperator",
                    "text": "==",
                  },
                  "right": {
                    "$type": "IntegerLiteral",
                    "text": "2",
                  },
                },
                "then": {
                  "$type": "Block",
                  "statements": [
                    {
                      "$type": "ReturnStatement",
                      "expression": {
                        "$type": "StringLiteral",
                        "text": "two",
                      },
                    },
                  ],
                },
              },
              {
                "$type": "ElseIfClause",
                "condition": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "operator": {
                    "$type": "EqualityOperator",
                    "text": "==",
                  },
                  "right": {
                    "$type": "IntegerLiteral",
                    "text": "3",
                  },
                },
                "then": {
                  "$type": "Block",
                  "statements": [
                    {
                      "$type": "ReturnStatement",
                      "expression": {
                        "$type": "StringLiteral",
                        "text": "three",
                      },
                    },
                  ],
                },
              },
            ],
            "then": {
              "$type": "Block",
              "statements": [
                {
                  "$type": "ReturnStatement",
                  "expression": {
                    "$type": "StringLiteral",
                    "text": "one",
                  },
                },
              ],
            },
          },
        ]
      `);
    });
  });

  describe("let declarations", () => {
    it("parses simple let declaration", async () => {
      const statements = await snapshotTest(`
        let x = 42;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "x",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "42",
            },
          },
        ]
      `);
    });

    it("parses array destructuring", async () => {
      const statements = await snapshotTest(`
        let [a, b, c] = [1, 2, 3];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ArrayDestructuring",
              "destructured": [
                {
                  "$type": "Identifier",
                  "id": "a",
                },
                {
                  "$type": "Identifier",
                  "id": "b",
                },
                {
                  "$type": "Identifier",
                  "id": "c",
                },
              ],
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "IntegerLiteral",
                  "text": "1",
                },
                {
                  "$type": "IntegerLiteral",
                  "text": "2",
                },
                {
                  "$type": "IntegerLiteral",
                  "text": "3",
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses object destructuring - shorthand", async () => {
      const statements = await snapshotTest(`
        let { name, age } = person;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ObjectDestructuring",
              "properties": [
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "age",
                  },
                },
              ],
            },
            "value": {
              "$type": "Identifier",
              "id": "person",
            },
          },
        ]
      `);
    });

    it("parses object destructuring - with renaming", async () => {
      const statements = await snapshotTest(`
        let { name: fullName, age: years } = person;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ObjectDestructuring",
              "properties": [
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "target": {
                    "$type": "Identifier",
                    "id": "fullName",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "age",
                  },
                  "target": {
                    "$type": "Identifier",
                    "id": "years",
                  },
                },
              ],
            },
            "value": {
              "$type": "Identifier",
              "id": "person",
            },
          },
        ]
      `);
    });

    it("parses object destructuring - mixed", async () => {
      const statements = await snapshotTest(`
        let { name, age: years, city } = person;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ObjectDestructuring",
              "properties": [
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "age",
                  },
                  "target": {
                    "$type": "Identifier",
                    "id": "years",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "city",
                  },
                },
              ],
            },
            "value": {
              "$type": "Identifier",
              "id": "person",
            },
          },
        ]
      `);
    });

    it("parses object destructuring - with rest spread", async () => {
      const statements = await snapshotTest(`
        let { name, ...rest } = person;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ObjectDestructuring",
              "properties": [
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                },
                {
                  "$type": "RestSpread",
                  "name": {
                    "$type": "Identifier",
                    "id": "rest",
                  },
                },
              ],
            },
            "value": {
              "$type": "Identifier",
              "id": "person",
            },
          },
        ]
      `);
    });

    it("parses object destructuring - complex", async () => {
      const statements = await snapshotTest(`
        let { name: fullName, age, city: location, ...others } = person;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "ObjectDestructuring",
              "properties": [
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "target": {
                    "$type": "Identifier",
                    "id": "fullName",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "age",
                  },
                },
                {
                  "$type": "PropertyPattern",
                  "key": {
                    "$type": "Identifier",
                    "id": "city",
                  },
                  "target": {
                    "$type": "Identifier",
                    "id": "location",
                  },
                },
                {
                  "$type": "RestSpread",
                  "name": {
                    "$type": "Identifier",
                    "id": "others",
                  },
                },
              ],
            },
            "value": {
              "$type": "Identifier",
              "id": "person",
            },
          },
        ]
      `);
    });
  });

  describe("comments", () => {
    it("parses single line comment", async () => {
      const statements = await snapshotTest(`
        // This is a comment
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "Comment",
            "text": "// This is a comment",
          },
        ]
      `);
    });

    it("parses multiline comment", async () => {
      const statements = await snapshotTest(`
        /* This is a 
           multiline comment */
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "MultiLineComment",
            "text": "/* This is a 
                   multiline comment */",
          },
        ]
      `);
    });

    it("parses code with comments", async () => {
      const statements = await snapshotTest(`
        // Variable declaration
        let x = 42;
        /* Another comment */
        let y = "hello";
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "Comment",
            "text": "// Variable declaration",
          },
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "x",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "42",
            },
          },
          {
            "$type": "MultiLineComment",
            "text": "/* Another comment */",
          },
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "y",
            },
            "value": {
              "$type": "StringLiteral",
              "text": "hello",
            },
          },
        ]
      `);
    });

    it("parses comments between code", async () => {
      const statements = await snapshotTest(`
        let a = 1;
        // Comment in the middle
        let b = 2;
        /* Multiline comment
           spanning multiple lines */
        let c = 3;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "a",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "1",
            },
          },
          {
            "$type": "Comment",
            "text": "// Comment in the middle",
          },
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "b",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "2",
            },
          },
          {
            "$type": "MultiLineComment",
            "text": "/* Multiline comment
                   spanning multiple lines */",
          },
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "c",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "3",
            },
          },
        ]
      `);
    });

    it("parses comment at end of let declaration", async () => {
      const statements = await snapshotTest(`
        let x = 42; // This is an inline comment
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "x",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "42",
            },
          },
          {
            "$type": "Comment",
            "text": "// This is an inline comment",
          },
        ]
      `);
    });
  });

  describe("Function Expressions", () => {
    it("parses arrow function expression", async () => {
      const statements = await snapshotTest(`
        let add = fun (x: Number, y: Number): Number => x + y;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "add",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "Identifier",
                  "id": "x",
                },
                "operator": {
                  "$type": "AdditionOperator",
                  "text": "+",
                },
                "right": {
                  "$type": "Identifier",
                  "id": "y",
                },
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
          },
        ]
      `);
    });

    it("parses block function expression", async () => {
      const statements = await snapshotTest(`
        let multiply = fun (a: Number, b: Number): Number {
          return a * b;
        };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "multiply",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "Block",
                "statements": [
                  {
                    "$type": "ReturnStatement",
                    "expression": {
                      "$type": "BinaryExpression",
                      "left": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "operator": {
                        "$type": "MultiplicationOperator",
                        "text": "*",
                      },
                      "right": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                    },
                  },
                ],
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "a",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "b",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
          },
        ]
      `);
    });

    it("parses arrow function without return type", async () => {
      const statements = await snapshotTest(`
        let square = fun (x: Number) => x * x;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "square",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "Identifier",
                  "id": "x",
                },
                "operator": {
                  "$type": "MultiplicationOperator",
                  "text": "*",
                },
                "right": {
                  "$type": "Identifier",
                  "id": "x",
                },
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses function expression with no parameters", async () => {
      const statements = await snapshotTest(`
        let getValue = fun (): Number => 42;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "getValue",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "IntegerLiteral",
                "text": "42",
              },
              "parameters": [],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
          },
        ]
      `);
    });

    it("parses function expression in array", async () => {
      const statements = await snapshotTest(`
        let funcs = [
          fun (x: Number) => x + 1,
          fun (x: Number) => x * 2
        ];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "funcs",
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "FunctionExpression",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "x",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "IntegerLiteral",
                      "text": "1",
                    },
                  },
                  "parameters": [
                    {
                      "$type": "ParameterDeclaration",
                      "name": {
                        "$type": "Identifier",
                        "id": "x",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                  ],
                },
                {
                  "$type": "FunctionExpression",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "x",
                    },
                    "operator": {
                      "$type": "MultiplicationOperator",
                      "text": "*",
                    },
                    "right": {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                  },
                  "parameters": [
                    {
                      "$type": "ParameterDeclaration",
                      "name": {
                        "$type": "Identifier",
                        "id": "x",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses block function expression without return type", async () => {
      const statements = await snapshotTest(`
        let greet = fun (name: String) {
          return "Hello, " + name;
        };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "greet",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
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
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses nested function expressions", async () => {
      const statements = await snapshotTest(`
        let makeAdder = fun (x: Number) => fun (y: Number) => x + y;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "makeAdder",
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "FunctionExpression",
                "body": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "operator": {
                    "$type": "AdditionOperator",
                    "text": "+",
                  },
                  "right": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                },
                "parameters": [
                  {
                    "$type": "ParameterDeclaration",
                    "name": {
                      "$type": "Identifier",
                      "id": "y",
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
            },
          },
        ]
      `);
    });
  });

  describe("Function Types", () => {
    it("parses function type without parameter names", async () => {
      const statements = await snapshotTest(`
        let operation: (Number, Number) => Number = fun (x: Number, y: Number): Number => x + y;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "operation",
            },
            "type": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "Identifier",
                  "id": "x",
                },
                "operator": {
                  "$type": "AdditionOperator",
                  "text": "+",
                },
                "right": {
                  "$type": "Identifier",
                  "id": "y",
                },
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
          },
        ]
      `);
    });

    it("parses function type with parameter names", async () => {
      const statements = await snapshotTest(`
        let greetFunction: (name: String, greeting: String) => String = fun (name: String, greeting: String): String => greeting + " " + name;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "greetFunction",
            },
            "type": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "greeting",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "String",
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "BinaryExpression",
                  "left": {
                    "$type": "Identifier",
                    "id": "greeting",
                  },
                  "operator": {
                    "$type": "AdditionOperator",
                    "text": "+",
                  },
                  "right": {
                    "$type": "StringLiteral",
                    "text": " ",
                  },
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
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "greeting",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "String",
              },
            },
          },
        ]
      `);
    });

    it("parses function type with mixed named and unnamed parameters", async () => {
      const statements = await snapshotTest(`
        let mixedFunction: (Number, name: String, Boolean) => Unit = fun (x: Number, name: String, flag: Boolean): Unit { return; };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "mixedFunction",
            },
            "type": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Unit",
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "Block",
                "statements": [
                  {
                    "$type": "ReturnStatement",
                  },
                ],
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "flag",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Unit",
              },
            },
          },
        ]
      `);
    });

    it("parses function type with no parameters", async () => {
      const statements = await snapshotTest(`
        let getValue: () => Number = fun (): Number => 42;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "getValue",
            },
            "type": {
              "$type": "FunctionType",
              "parameters": [],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "IntegerLiteral",
                "text": "42",
              },
              "parameters": [],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Number",
                },
              },
            },
          },
        ]
      `);
    });

    it("parses nested function types", async () => {
      const statements = await snapshotTest(`
        let curryFunction: (Number) => (String) => Boolean = fun (x: Number) => fun (s: String) => true;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "curryFunction",
            },
            "type": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "FunctionType",
                "parameters": [
                  {
                    "$type": "FunctionTypeParameter",
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                ],
                "returnType": {
                  "$type": "PrimitiveType",
                  "name": "Boolean",
                },
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "FunctionExpression",
                "body": {
                  "$type": "BooleanLiteral",
                  "text": "true",
                },
                "parameters": [
                  {
                    "$type": "ParameterDeclaration",
                    "name": {
                      "$type": "Identifier",
                      "id": "s",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                ],
              },
              "parameters": [
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses function parameter with function type", async () => {
      const statements = await snapshotTest(`
        fun applyOperation(op: (Number, Number) => Number, x: Number, y: Number): Number {
          return op(x, y);
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
                    "$type": "CallExpression",
                    "arguments": [
                      {
                        "$type": "Identifier",
                        "id": "x",
                      },
                      {
                        "$type": "Identifier",
                        "id": "y",
                      },
                    ],
                    "callee": {
                      "$type": "Identifier",
                      "id": "op",
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "applyOperation",
            },
            "parameters": [
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "op",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              },
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "x",
                },
                "type": {
                  "$type": "TypeReference",
                  "name": {
                    "$type": "Identifier",
                    "id": "Number",
                  },
                },
              },
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "y",
                },
                "type": {
                  "$type": "TypeReference",
                  "name": {
                    "$type": "Identifier",
                    "id": "Number",
                  },
                },
              },
            ],
            "returnType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Number",
              },
            },
          },
        ]
      `);
    });
  });

  describe("Call Expressions", () => {
    it("parses simple function call", async () => {
      const statements = await snapshotTest(`
        add(1, 2);
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [
                {
                  "$type": "IntegerLiteral",
                  "text": "1",
                },
                {
                  "$type": "IntegerLiteral",
                  "text": "2",
                },
              ],
              "callee": {
                "$type": "Identifier",
                "id": "add",
              },
            },
          },
        ]
      `);
    });

    it("parses function call with no arguments", async () => {
      const statements = await snapshotTest(`
        getValue();
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [],
              "callee": {
                "$type": "Identifier",
                "id": "getValue",
              },
            },
          },
        ]
      `);
    });

    it("parses function call with single argument", async () => {
      const statements = await snapshotTest(`
        square(5);
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [
                {
                  "$type": "IntegerLiteral",
                  "text": "5",
                },
              ],
              "callee": {
                "$type": "Identifier",
                "id": "square",
              },
            },
          },
        ]
      `);
    });

    it("parses nested function calls", async () => {
      const statements = await snapshotTest(`
        add(multiply(2, 3), square(4));
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [
                {
                  "$type": "CallExpression",
                  "arguments": [
                    {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                    {
                      "$type": "IntegerLiteral",
                      "text": "3",
                    },
                  ],
                  "callee": {
                    "$type": "Identifier",
                    "id": "multiply",
                  },
                },
                {
                  "$type": "CallExpression",
                  "arguments": [
                    {
                      "$type": "IntegerLiteral",
                      "text": "4",
                    },
                  ],
                  "callee": {
                    "$type": "Identifier",
                    "id": "square",
                  },
                },
              ],
              "callee": {
                "$type": "Identifier",
                "id": "add",
              },
            },
          },
        ]
      `);
    });
  });

  describe("Member Expressions", () => {
    it("parses dot notation member access", async () => {
      const statements = await snapshotTest(`
        user.name;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MemberExpression",
              "object": {
                "$type": "Identifier",
                "id": "user",
              },
              "property": {
                "$type": "Identifier",
                "id": "name",
              },
            },
          },
        ]
      `);
    });

    it("parses bracket notation member access with string", async () => {
      const statements = await snapshotTest(`
        user["name"];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MemberExpression",
              "object": {
                "$type": "Identifier",
                "id": "user",
              },
              "property": {
                "$type": "StringLiteral",
                "text": "name",
              },
            },
          },
        ]
      `);
    });

    it("parses bracket notation member access with number", async () => {
      const statements = await snapshotTest(`
        items[0];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MemberExpression",
              "object": {
                "$type": "Identifier",
                "id": "items",
              },
              "property": {
                "$type": "IntegerLiteral",
                "text": "0",
              },
            },
          },
        ]
      `);
    });

    it("parses bracket notation member access with variable", async () => {
      const statements = await snapshotTest(`
        obj[key];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MemberExpression",
              "object": {
                "$type": "Identifier",
                "id": "obj",
              },
              "property": {
                "$type": "Identifier",
                "id": "key",
              },
            },
          },
        ]
      `);
    });

    it("parses member expression in function call", async () => {
      const statements = await snapshotTest(`
        process(user.name);
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [
                {
                  "$type": "MemberExpression",
                  "object": {
                    "$type": "Identifier",
                    "id": "user",
                  },
                  "property": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                },
              ],
              "callee": {
                "$type": "Identifier",
                "id": "process",
              },
            },
          },
        ]
      `);
    });

    it("parses member expression in assignment", async () => {
      const statements = await snapshotTest(`
        let name = user.name;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "name",
            },
            "value": {
              "$type": "MemberExpression",
              "object": {
                "$type": "Identifier",
                "id": "user",
              },
              "property": {
                "$type": "Identifier",
                "id": "name",
              },
            },
          },
        ]
      `);
    });

    it("parses member expression function call", async () => {
      const statements = await snapshotTest(`
        user.greet("Hello");
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "CallExpression",
              "arguments": [
                {
                  "$type": "StringLiteral",
                  "text": "Hello",
                },
              ],
              "callee": {
                "$type": "MemberExpression",
                "object": {
                  "$type": "Identifier",
                  "id": "user",
                },
                "property": {
                  "$type": "Identifier",
                  "id": "greet",
                },
              },
            },
          },
        ]
      `);
    });
  });

  describe("Array Types (Postfix)", () => {
    it("parses simple array type", async () => {
      const statements = await snapshotTest(`
        let numbers: String[] = ["a", "b"];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "numbers",
            },
            "type": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "PrimitiveType",
                "name": "String",
              },
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "StringLiteral",
                  "text": "a",
                },
                {
                  "$type": "StringLiteral",
                  "text": "b",
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses nested array type", async () => {
      const statements = await snapshotTest(`
        let matrix: Number[][] = [[1, 2], [3, 4]];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "matrix",
            },
            "type": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "ArrayType",
                "elementType": {
                  "$type": "TypeReference",
                  "name": {
                    "$type": "Identifier",
                    "id": "Number",
                  },
                },
              },
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "ArrayLiteral",
                  "elements": [
                    {
                      "$type": "IntegerLiteral",
                      "text": "1",
                    },
                    {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                  ],
                },
                {
                  "$type": "ArrayLiteral",
                  "elements": [
                    {
                      "$type": "IntegerLiteral",
                      "text": "3",
                    },
                    {
                      "$type": "IntegerLiteral",
                      "text": "4",
                    },
                  ],
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses array of function types", async () => {
      const statements = await snapshotTest(`
        let operations: ((Number, Number) => Number)[] = [fun (x: Number, y: Number) => x + y];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "operations",
            },
            "type": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "FunctionType",
                "parameters": [
                  {
                    "$type": "FunctionTypeParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                  {
                    "$type": "FunctionTypeParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
                "returnType": {
                  "$type": "TypeReference",
                  "name": {
                    "$type": "Identifier",
                    "id": "Number",
                  },
                },
              },
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "FunctionExpression",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "x",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "y",
                    },
                  },
                  "parameters": [
                    {
                      "$type": "ParameterDeclaration",
                      "name": {
                        "$type": "Identifier",
                        "id": "x",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                    {
                      "$type": "ParameterDeclaration",
                      "name": {
                        "$type": "Identifier",
                        "id": "y",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "Number",
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses function returning array type", async () => {
      const statements = await snapshotTest(`
        fun getNumbers(): String[] {
          return ["hello"];
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
                    "$type": "ArrayLiteral",
                    "elements": [
                      {
                        "$type": "StringLiteral",
                        "text": "hello",
                      },
                    ],
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "getNumbers",
            },
            "parameters": [],
            "returnType": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "PrimitiveType",
                "name": "String",
              },
            },
          },
        ]
      `);
    });
  });

  describe("Literal Types", () => {
    it("parses true literal type", async () => {
      const statements = await snapshotTest(`
        let isReady: true = true;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "isReady",
            },
            "type": {
              "$type": "BooleanLiteralType",
              "text": "true",
            },
            "value": {
              "$type": "BooleanLiteral",
              "text": "true",
            },
          },
        ]
      `);
    });

    it("parses false literal type", async () => {
      const statements = await snapshotTest(`
        let isDisabled: false = false;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "isDisabled",
            },
            "type": {
              "$type": "BooleanLiteralType",
              "text": "false",
            },
            "value": {
              "$type": "BooleanLiteral",
              "text": "false",
            },
          },
        ]
      `);
    });

    it("parses string literal type", async () => {
      const statements = await snapshotTest(`
        let status: "pending" = "pending";
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "status",
            },
            "type": {
              "$type": "StringLiteralType",
              "text": "pending",
            },
            "value": {
              "$type": "StringLiteral",
              "text": "pending",
            },
          },
        ]
      `);
    });

    it("parses number literal type", async () => {
      const statements = await snapshotTest(`
        let version: 42 = 42;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "version",
            },
            "type": {
              "$type": "IntegerLiteralType",
              "text": "42",
            },
            "value": {
              "$type": "IntegerLiteral",
              "text": "42",
            },
          },
        ]
      `);
    });

    it("parses float literal type", async () => {
      const statements = await snapshotTest(`
        let pi: 3.14 = 3.14;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "pi",
            },
            "type": {
              "$type": "FloatLiteralType",
              "text": "3.14",
            },
            "value": {
              "$type": "FloatLiteral",
              "text": "3.14",
            },
          },
        ]
      `);
    });

    it("parses BigInt literal type", async () => {
      const statements = await snapshotTest(`
        let bigNum: 999n = 999n;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "bigNum",
            },
            "type": {
              "$type": "BigIntLiteralType",
              "text": "999n",
            },
            "value": {
              "$type": "BigIntLiteral",
              "text": "999n",
            },
          },
        ]
      `);
    });

    it("parses BigDecimal literal type", async () => {
      const statements = await snapshotTest(`
        let bigDec: 123.456n = 123.456n;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "bigDec",
            },
            "type": {
              "$type": "BigDecimalLiteralType",
              "text": "123.456n",
            },
            "value": {
              "$type": "BigDecimalLiteral",
              "text": "123.456n",
            },
          },
        ]
      `);
    });

    it("parses function with literal type parameter", async () => {
      const statements = await snapshotTest(`
        fun handleStatus(status: "success"): Boolean {
          return true;
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
                    "$type": "BooleanLiteral",
                    "text": "true",
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "handleStatus",
            },
            "parameters": [
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "status",
                },
                "type": {
                  "$type": "StringLiteralType",
                  "text": "success",
                },
              },
            ],
            "returnType": {
              "$type": "PrimitiveType",
              "name": "Boolean",
            },
          },
        ]
      `);
    });

    it("parses array of literal types", async () => {
      const statements = await snapshotTest(`
        let states: "pending"[] = ["pending"];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "LetDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "states",
            },
            "type": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "StringLiteralType",
                "text": "pending",
              },
            },
            "value": {
              "$type": "ArrayLiteral",
              "elements": [
                {
                  "$type": "StringLiteral",
                  "text": "pending",
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses literal type in function return", async () => {
      const statements = await snapshotTest(`
        fun getStatus(): "ready" {
          return "ready";
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
                    "$type": "StringLiteral",
                    "text": "ready",
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "getStatus",
            },
            "parameters": [],
            "returnType": {
              "$type": "StringLiteralType",
              "text": "ready",
            },
          },
        ]
      `);
    });
  });

  describe("Type Alias Declarations", () => {
    it("parses simple type alias", async () => {
      const statements = await snapshotTest(`
        type MyString = String;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "PrimitiveType",
              "name": "String",
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "MyString",
            },
          },
        ]
      `);
    });

    it("parses object type alias", async () => {
      const statements = await snapshotTest(`
        type Point = { x: Number, y: Number };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ObjectType",
              "properties": [
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "x",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Number",
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Point",
            },
          },
        ]
      `);
    });

    it("parses function type alias", async () => {
      const statements = await snapshotTest(`
        type Handler = (event: String) => Boolean;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "event",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Boolean",
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Handler",
            },
          },
        ]
      `);
    });

    it("parses array type alias", async () => {
      const statements = await snapshotTest(`
        type StringList = String[];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "PrimitiveType",
                "name": "String",
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "StringList",
            },
          },
        ]
      `);
    });

    it("parses exported type alias", async () => {
      const statements = await snapshotTest(`
        export type PublicType = Number;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Number",
              },
            },
            "exported": true,
            "name": {
              "$type": "Identifier",
              "id": "PublicType",
            },
          },
        ]
      `);
    });

    it("parses complex nested type alias", async () => {
      const statements = await snapshotTest(`
        type ComplexType = { 
          name: String, 
          handler: (String) => Boolean,
          items: Number[]
        };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ObjectType",
              "properties": [
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "handler",
                  },
                  "type": {
                    "$type": "FunctionType",
                    "parameters": [
                      {
                        "$type": "FunctionTypeParameter",
                        "type": {
                          "$type": "PrimitiveType",
                          "name": "String",
                        },
                      },
                    ],
                    "returnType": {
                      "$type": "PrimitiveType",
                      "name": "Boolean",
                    },
                  },
                },
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "items",
                  },
                  "type": {
                    "$type": "ArrayType",
                    "elementType": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "ComplexType",
            },
          },
        ]
      `);
    });

    it("parses literal type alias", async () => {
      const statements = await snapshotTest(`
        type Status = "pending";
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "StringLiteralType",
              "text": "pending",
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Status",
            },
          },
        ]
      `);
    });

    it("parses type alias using another type alias", async () => {
      const statements = await snapshotTest(`
        type UserId = Number;
        type User = { id: UserId, name: String };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Number",
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "UserId",
            },
          },
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ObjectType",
              "properties": [
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "id",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "UserId",
                    },
                  },
                },
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "User",
            },
          },
        ]
      `);
    });

    it("parses type alias with single type parameter", async () => {
      const statements = await snapshotTest(`
        type Box<T> = { value: T };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ObjectType",
              "properties": [
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "value",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "T",
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Box",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses type alias with multiple type parameters", async () => {
      const statements = await snapshotTest(`
        type Pair<A, B> = { first: A, second: B };
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ObjectType",
              "properties": [
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "first",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "A",
                    },
                  },
                },
                {
                  "$type": "PropertyType",
                  "key": {
                    "$type": "Identifier",
                    "id": "second",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "B",
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Pair",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "A",
                  },
                },
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "B",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses exported type alias with type parameters", async () => {
      const statements = await snapshotTest(`
        export type Result<T> = T[];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "T",
                },
              },
            },
            "exported": true,
            "name": {
              "$type": "Identifier",
              "id": "Result",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses type alias with type parameter in function type", async () => {
      const statements = await snapshotTest(`
        type Mapper<T, U> = (T) => U;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "T",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "U",
                },
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Mapper",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "U",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses type alias with type parameter in array type", async () => {
      const statements = await snapshotTest(`
        type List<T> = T[];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "T",
                },
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "List",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses complex type alias with multiple type parameters", async () => {
      const statements = await snapshotTest(`
        type Transform<T, U, V> = (T, U) => V;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "FunctionType",
              "parameters": [
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "T",
                    },
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "U",
                    },
                  },
                },
              ],
              "returnType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "V",
                },
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Transform",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "U",
                  },
                },
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "V",
                  },
                },
              ],
            },
          },
        ]
      `);
    });
  });

  describe("Data Declarations", () => {
    it("parses simple enum-like data declaration", async () => {
      const statements = await snapshotTest(`
        data Color = Red | Green | Blue
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Red",
                },
              },
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Green",
                },
              },
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Blue",
                },
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Color",
            },
          },
        ]
      `);
    });

    it("parses data declaration with single constructor", async () => {
      const statements = await snapshotTest(`
        data Status = Active
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Active",
                },
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Status",
            },
          },
        ]
      `);
    });

    it("parses data declaration with tuple constructors", async () => {
      const statements = await snapshotTest(`
        data Point = Point(Number, Number)
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Point",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Point",
            },
          },
        ]
      `);
    });

    it("parses data declaration with object constructors", async () => {
      const statements = await snapshotTest(`
        data Person = Person{name: String, age: Number}
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "ObjectConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Person",
                },
                "parameters": [
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "name",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "age",
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Person",
            },
          },
        ]
      `);
    });

    it("parses data declaration with mixed constructors", async () => {
      const statements = await snapshotTest(`
        data Shape = Circle(radius: Number) | Rectangle(Number, Number) | Point
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Circle",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "name": {
                      "$type": "Identifier",
                      "id": "radius",
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Rectangle",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Point",
                },
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Shape",
            },
          },
        ]
      `);
    });

    it("parses exported data declaration", async () => {
      const statements = await snapshotTest(`
        export data Result = Success | Error
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Success",
                },
              },
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Error",
                },
              },
            ],
            "exported": true,
            "name": {
              "$type": "Identifier",
              "id": "Result",
            },
          },
        ]
      `);
    });

    it("parses data declaration with complex tuple constructor", async () => {
      const statements = await snapshotTest(`
        data Response = Response(String, Number, Boolean)
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Response",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "Boolean",
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Response",
            },
          },
        ]
      `);
    });

    it("parses data declaration with complex object constructor", async () => {
      const statements = await snapshotTest(`
        data User = User{id: Number, name: String, email: String, active: Boolean}
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "ObjectConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "User",
                },
                "parameters": [
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "id",
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "name",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "email",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                  {
                    "$type": "PropertyType",
                    "key": {
                      "$type": "Identifier",
                      "id": "active",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "Boolean",
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "User",
            },
          },
        ]
      `);
    });

    it("parses data declaration with type parameters", async () => {
      const statements = await snapshotTest(`
        data Maybe<T> = None | Some(T)
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "None",
                },
              },
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Some",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "T",
                      },
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Maybe",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses complex data declaration with multiple constructor types", async () => {
      const statements = await snapshotTest(`
        data Option = None | Some(String) | Complex(value: String, meta: Number)
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "DataDeclaration",
            "constructors": [
              {
                "$type": "VoidConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "None",
                },
              },
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Some",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                ],
              },
              {
                "$type": "TupleConstructor",
                "name": {
                  "$type": "Identifier",
                  "id": "Complex",
                },
                "parameters": [
                  {
                    "$type": "TupleConstructorParameter",
                    "name": {
                      "$type": "Identifier",
                      "id": "value",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                  {
                    "$type": "TupleConstructorParameter",
                    "name": {
                      "$type": "Identifier",
                      "id": "meta",
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                ],
              },
            ],
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Option",
            },
          },
        ]
      `);
    });
  });

  describe("Typeclass Declarations", () => {
    it("parses simple typeclass declaration", async () => {
      const statements = await snapshotTest(`
        typeclass Eq {
          eq: (a: T, b: T) => Boolean
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Eq",
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "eq",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses typeclass declaration with type parameters", async () => {
      const statements = await snapshotTest(`
        typeclass Functor<F> {
          map: (f: (a: A) => B, fa: F) => F
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Functor",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "F",
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "map",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "f",
                      },
                      "type": {
                        "$type": "FunctionType",
                        "parameters": [
                          {
                            "$type": "FunctionTypeParameter",
                            "name": {
                              "$type": "Identifier",
                              "id": "a",
                            },
                            "type": {
                              "$type": "TypeReference",
                              "name": {
                                "$type": "Identifier",
                                "id": "A",
                              },
                            },
                          },
                        ],
                        "returnType": {
                          "$type": "TypeReference",
                          "name": {
                            "$type": "Identifier",
                            "id": "B",
                          },
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "fa",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "F",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "F",
                    },
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses typeclass declaration with multiple properties", async () => {
      const statements = await snapshotTest(`
        typeclass Ord<T> {
          compare: (a: T, b: T) => Int
          lessThan: (a: T, b: T) => Boolean
          greaterThan: (a: T, b: T) => Boolean
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Ord",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "compare",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Int",
                  },
                },
              },
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "lessThan",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              },
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "greaterThan",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses exported typeclass declaration", async () => {
      const statements = await snapshotTest(`
        export typeclass Show<T> {
          show: (value: T) => String
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": true,
            "name": {
              "$type": "Identifier",
              "id": "Show",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "show",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "value",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses empty typeclass declaration", async () => {
      const statements = await snapshotTest(`
        typeclass Marker {
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Marker",
            },
            "properties": [],
          },
        ]
      `);
    });

    it("parses typeclass declaration with constrained type parameters", async () => {
      const statements = await snapshotTest(`
        typeclass Monad<M: Functor> {
          pure: (value: A) => M
          flatMap: (ma: M, f: (a: A) => M) => M
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Monad",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "M",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Functor",
                    },
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "pure",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "value",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "A",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "M",
                    },
                  },
                },
              },
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "flatMap",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "ma",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "M",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "f",
                      },
                      "type": {
                        "$type": "FunctionType",
                        "parameters": [
                          {
                            "$type": "FunctionTypeParameter",
                            "name": {
                              "$type": "Identifier",
                              "id": "a",
                            },
                            "type": {
                              "$type": "TypeReference",
                              "name": {
                                "$type": "Identifier",
                                "id": "A",
                              },
                            },
                          },
                        ],
                        "returnType": {
                          "$type": "TypeReference",
                          "name": {
                            "$type": "Identifier",
                            "id": "M",
                          },
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "M",
                    },
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses typeclass declaration with complex method signatures", async () => {
      const statements = await snapshotTest(`
        typeclass Semigroup<T> {
          combine: (a: T, b: T) => T
          combineAll: (values: T[]) => T
          isEmpty: () => Boolean
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Semigroup",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "T",
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "combine",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "b",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "T",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "T",
                    },
                  },
                },
              },
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "combineAll",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "values",
                      },
                      "type": {
                        "$type": "ArrayType",
                        "elementType": {
                          "$type": "TypeReference",
                          "name": {
                            "$type": "Identifier",
                            "id": "T",
                          },
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "T",
                    },
                  },
                },
              },
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "isEmpty",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Boolean",
                  },
                },
              },
            ],
          },
        ]
      `);
    });
  });

  describe("Higher-Kinded Types", () => {
    it("parses simple type hole", async () => {
      const statements = await snapshotTest(`
        type T = _;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeHole",
              "hole": "_",
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "T",
            },
          },
        ]
      `);
    });

    it("parses higher-kinded type with single type hole", async () => {
      const statements = await snapshotTest(`
        type F = Option<_>;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Option",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                ],
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });

    it("parses higher-kinded type with multiple type holes", async () => {
      const statements = await snapshotTest(`
        type F = Either<_, _>;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Either",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                ],
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });

    it("parses higher-kinded type with mixed concrete types and type holes", async () => {
      const statements = await snapshotTest(`
        type F = Result<String, _>;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Result",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "PrimitiveType",
                    "name": "String",
                  },
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                ],
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });

    it("parses higher-kinded type with concrete type in middle", async () => {
      const statements = await snapshotTest(`
        type F = Triple<_, Int, _>;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Triple",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                  {
                    "$type": "PrimitiveType",
                    "name": "Int",
                  },
                  {
                    "$type": "TypeHole",
                    "hole": "_",
                  },
                ],
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });

    it("parses nested higher-kinded types", async () => {
      const statements = await snapshotTest(`
        type F = Option<Result<_, String>>;
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "Option",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Result",
                    },
                    "typeArguments": {
                      "$type": "TypeArgumentList",
                      "arguments": [
                        {
                          "$type": "TypeHole",
                          "hole": "_",
                        },
                        {
                          "$type": "PrimitiveType",
                          "name": "String",
                        },
                      ],
                    },
                  },
                ],
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });

    it("parses function with higher-kinded type parameters", async () => {
      const statements = await snapshotTest(`
        fun map<F: Functor>(f: (a: A) => B, fa: F<A>): F<B> {
          return fa.map(f);
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
                    "$type": "CallExpression",
                    "arguments": [
                      {
                        "$type": "Identifier",
                        "id": "f",
                      },
                    ],
                    "callee": {
                      "$type": "MemberExpression",
                      "object": {
                        "$type": "Identifier",
                        "id": "fa",
                      },
                      "property": {
                        "$type": "Identifier",
                        "id": "map",
                      },
                    },
                  },
                },
              ],
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "map",
            },
            "parameters": [
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "f",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "a",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "A",
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "B",
                    },
                  },
                },
              },
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "fa",
                },
                "type": {
                  "$type": "TypeReference",
                  "name": {
                    "$type": "Identifier",
                    "id": "F",
                  },
                  "typeArguments": {
                    "$type": "TypeArgumentList",
                    "arguments": [
                      {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "A",
                        },
                      },
                    ],
                  },
                },
              },
            ],
            "returnType": {
              "$type": "TypeReference",
              "name": {
                "$type": "Identifier",
                "id": "F",
              },
              "typeArguments": {
                "$type": "TypeArgumentList",
                "arguments": [
                  {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "B",
                    },
                  },
                ],
              },
            },
            "typeParameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "name": {
                    "$type": "Identifier",
                    "id": "F",
                  },
                  "type": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "Functor",
                    },
                  },
                },
              ],
            },
          },
        ]
      `);
    });

    it("parses typeclass with higher-kinded type parameters", async () => {
      const statements = await snapshotTest(`
        typeclass Functor<F<_>> {
          map: (f: (a: A) => B, fa: F<A>) => F<B>
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeclassDeclaration",
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "Functor",
            },
            "parameters": {
              "$type": "TypeParameterList",
              "parameters": [
                {
                  "$type": "TypeParameter",
                  "arguments": {
                    "$type": "TypeArgumentList",
                    "arguments": [
                      {
                        "$type": "TypeHole",
                        "hole": "_",
                      },
                    ],
                  },
                  "name": {
                    "$type": "Identifier",
                    "id": "F",
                  },
                },
              ],
            },
            "properties": [
              {
                "$type": "TypeclassProperty",
                "name": {
                  "$type": "Identifier",
                  "id": "map",
                },
                "type": {
                  "$type": "FunctionType",
                  "parameters": [
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "f",
                      },
                      "type": {
                        "$type": "FunctionType",
                        "parameters": [
                          {
                            "$type": "FunctionTypeParameter",
                            "name": {
                              "$type": "Identifier",
                              "id": "a",
                            },
                            "type": {
                              "$type": "TypeReference",
                              "name": {
                                "$type": "Identifier",
                                "id": "A",
                              },
                            },
                          },
                        ],
                        "returnType": {
                          "$type": "TypeReference",
                          "name": {
                            "$type": "Identifier",
                            "id": "B",
                          },
                        },
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "name": {
                        "$type": "Identifier",
                        "id": "fa",
                      },
                      "type": {
                        "$type": "TypeReference",
                        "name": {
                          "$type": "Identifier",
                          "id": "F",
                        },
                        "typeArguments": {
                          "$type": "TypeArgumentList",
                          "arguments": [
                            {
                              "$type": "TypeReference",
                              "name": {
                                "$type": "Identifier",
                                "id": "A",
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "TypeReference",
                    "name": {
                      "$type": "Identifier",
                      "id": "F",
                    },
                    "typeArguments": {
                      "$type": "TypeArgumentList",
                      "arguments": [
                        {
                          "$type": "TypeReference",
                          "name": {
                            "$type": "Identifier",
                            "id": "B",
                          },
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        ]
      `);
    });

    it("parses array of higher-kinded types", async () => {
      const statements = await snapshotTest(`
        type F = Option<_>[];
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "TypeAliasDeclaration",
            "aliasType": {
              "$type": "ArrayType",
              "elementType": {
                "$type": "TypeReference",
                "name": {
                  "$type": "Identifier",
                  "id": "Option",
                },
                "typeArguments": {
                  "$type": "TypeArgumentList",
                  "arguments": [
                    {
                      "$type": "TypeHole",
                      "hole": "_",
                    },
                  ],
                },
              },
            },
            "exported": false,
            "name": {
              "$type": "Identifier",
              "id": "F",
            },
          },
        ]
      `);
    });
  });

  describe("Pattern Matching", () => {
    it("parses simple match expression with literal patterns", async () => {
      const statements = await snapshotTest(`
        match (x) {
          1 => "one";
          2 => "two";
          _ => "other";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "one",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "IntegerLiteral",
                      "text": "1",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "two",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "other",
                  },
                  "pattern": {
                    "$type": "WildcardPattern",
                    "text": "_",
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "x",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with variable patterns", async () => {
      const statements = await snapshotTest(`
        match (value) {
          n => n + 1;
          _ => 0;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "n",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "IntegerLiteral",
                      "text": "1",
                    },
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "n",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "0",
                  },
                  "pattern": {
                    "$type": "WildcardPattern",
                    "text": "_",
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "value",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with constructor patterns", async () => {
      const statements = await snapshotTest(`
        match (shape) {
          Circle(radius) => radius * 2;
          Rectangle(width, height) => width * height;
          Point => 0;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "radius",
                    },
                    "operator": {
                      "$type": "MultiplicationOperator",
                      "text": "*",
                    },
                    "right": {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Circle",
                    },
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "radius",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "width",
                    },
                    "operator": {
                      "$type": "MultiplicationOperator",
                      "text": "*",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "height",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Rectangle",
                    },
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "width",
                        },
                      },
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "height",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "0",
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "Point",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "shape",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with object constructor patterns", async () => {
      const statements = await snapshotTest(`
        match (person) {
          Person{name: "John", age} => age;
          Person{name, age: 25} => name;
          Person{name} => name + " (unknown age)";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "Identifier",
                    "id": "age",
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Person",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "name",
                          },
                          "pattern": {
                            "$type": "LiteralPattern",
                            "value": {
                              "$type": "StringLiteral",
                              "text": "John",
                            },
                          },
                        },
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "age",
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Person",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "name",
                          },
                        },
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "age",
                          },
                          "pattern": {
                            "$type": "LiteralPattern",
                            "value": {
                              "$type": "IntegerLiteral",
                              "text": "25",
                            },
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "name",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "StringLiteral",
                      "text": " (unknown age)",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Person",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "name",
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "person",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with array constructor patterns", async () => {
      const statements = await snapshotTest(`
        match (items) {
          Array() => "empty";
          Array(first) => first;
          Array(first, second) => first + second;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "empty",
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Array",
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "Identifier",
                    "id": "first",
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Array",
                    },
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "first",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "first",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "second",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Array",
                    },
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "first",
                        },
                      },
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "second",
                        },
                      },
                    ],
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "items",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with object patterns", async () => {
      const statements = await snapshotTest(`
        match (obj) {
          {x: 0, y: 0} => "origin";
          {x, y} => x + y;
          {name, ...props} => name;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "origin",
                  },
                  "pattern": {
                    "$type": "ObjectPattern",
                    "fields": [
                      {
                        "$type": "FieldPattern",
                        "field": {
                          "$type": "Identifier",
                          "id": "x",
                        },
                        "pattern": {
                          "$type": "LiteralPattern",
                          "value": {
                            "$type": "IntegerLiteral",
                            "text": "0",
                          },
                        },
                      },
                      {
                        "$type": "FieldPattern",
                        "field": {
                          "$type": "Identifier",
                          "id": "y",
                        },
                        "pattern": {
                          "$type": "LiteralPattern",
                          "value": {
                            "$type": "IntegerLiteral",
                            "text": "0",
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "x",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "y",
                    },
                  },
                  "pattern": {
                    "$type": "ObjectPattern",
                    "fields": [
                      {
                        "$type": "FieldPattern",
                        "field": {
                          "$type": "Identifier",
                          "id": "x",
                        },
                      },
                      {
                        "$type": "FieldPattern",
                        "field": {
                          "$type": "Identifier",
                          "id": "y",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "Identifier",
                    "id": "name",
                  },
                  "pattern": {
                    "$type": "ObjectPattern",
                    "fields": [
                      {
                        "$type": "FieldPattern",
                        "field": {
                          "$type": "Identifier",
                          "id": "name",
                        },
                      },
                    ],
                    "restPattern": {
                      "$type": "Identifier",
                      "id": "props",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "obj",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with array patterns", async () => {
      const statements = await snapshotTest(`
        match (items) {
          [] => "empty";
          [first] => first;
          [first, second] => first + second;
        }`);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "empty",
                  },
                  "pattern": {
                    "$type": "ArrayPattern",
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "Identifier",
                    "id": "first",
                  },
                  "pattern": {
                    "$type": "ArrayPattern",
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "first",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "first",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "second",
                    },
                  },
                  "pattern": {
                    "$type": "ArrayPattern",
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "first",
                        },
                      },
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "second",
                        },
                      },
                    ],
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "items",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with type patterns", async () => {
      const statements = await snapshotTest(`
        match (value) {
          x: String => x + " is a string";
          n: Number => n * 2;
          _: Boolean => true;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "x",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "StringLiteral",
                      "text": " is a string",
                    },
                  },
                  "pattern": {
                    "$type": "TypedPattern",
                    "pattern": {
                      "$type": "VariablePattern",
                      "name": {
                        "$type": "Identifier",
                        "id": "x",
                      },
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "String",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "Identifier",
                      "id": "n",
                    },
                    "operator": {
                      "$type": "MultiplicationOperator",
                      "text": "*",
                    },
                    "right": {
                      "$type": "IntegerLiteral",
                      "text": "2",
                    },
                  },
                  "pattern": {
                    "$type": "TypedPattern",
                    "pattern": {
                      "$type": "VariablePattern",
                      "name": {
                        "$type": "Identifier",
                        "id": "n",
                      },
                    },
                    "type": {
                      "$type": "TypeReference",
                      "name": {
                        "$type": "Identifier",
                        "id": "Number",
                      },
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BooleanLiteral",
                    "text": "true",
                  },
                  "pattern": {
                    "$type": "TypedPattern",
                    "pattern": {
                      "$type": "WildcardPattern",
                      "text": "_",
                    },
                    "type": {
                      "$type": "PrimitiveType",
                      "name": "Boolean",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "value",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with guard expressions", async () => {
      const statements = await snapshotTest(`
        match (x) {
          n if n > 0 => "positive";
          n if n < 0 => "negative";
          _ => "zero";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "positive",
                  },
                  "guard": {
                    "$type": "GuardExpression",
                    "condition": {
                      "$type": "BinaryExpression",
                      "left": {
                        "$type": "Identifier",
                        "id": "n",
                      },
                      "operator": {
                        "$type": "ComparisonOperator",
                        "operator": {
                          "$type": "GreaterThanOperator",
                          "text": ">",
                        },
                      },
                      "right": {
                        "$type": "IntegerLiteral",
                        "text": "0",
                      },
                    },
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "n",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "negative",
                  },
                  "guard": {
                    "$type": "GuardExpression",
                    "condition": {
                      "$type": "BinaryExpression",
                      "left": {
                        "$type": "Identifier",
                        "id": "n",
                      },
                      "operator": {
                        "$type": "ComparisonOperator",
                        "operator": {
                          "$type": "LessThanOperator",
                          "text": "<",
                        },
                      },
                      "right": {
                        "$type": "IntegerLiteral",
                        "text": "0",
                      },
                    },
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "n",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "zero",
                  },
                  "pattern": {
                    "$type": "WildcardPattern",
                    "text": "_",
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "x",
              },
            },
          },
        ]
      `);
    });

    it("parses complex match expression with mixed patterns", async () => {
      const statements = await snapshotTest(`
        match (result) {
          Success{value: x} if x > 100 => "big success";
          Success{value} => "success: " + value;
          Error{message: msg} => "error: " + msg;
          _ => "unknown";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "big success",
                  },
                  "guard": {
                    "$type": "GuardExpression",
                    "condition": {
                      "$type": "BinaryExpression",
                      "left": {
                        "$type": "Identifier",
                        "id": "x",
                      },
                      "operator": {
                        "$type": "ComparisonOperator",
                        "operator": {
                          "$type": "GreaterThanOperator",
                          "text": ">",
                        },
                      },
                      "right": {
                        "$type": "IntegerLiteral",
                        "text": "100",
                      },
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Success",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "value",
                          },
                          "pattern": {
                            "$type": "VariablePattern",
                            "name": {
                              "$type": "Identifier",
                              "id": "x",
                            },
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "StringLiteral",
                      "text": "success: ",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "value",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Success",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "value",
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "BinaryExpression",
                    "left": {
                      "$type": "StringLiteral",
                      "text": "error: ",
                    },
                    "operator": {
                      "$type": "AdditionOperator",
                      "text": "+",
                    },
                    "right": {
                      "$type": "Identifier",
                      "id": "msg",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Error",
                    },
                    "pattern": {
                      "$type": "ObjectPattern",
                      "fields": [
                        {
                          "$type": "FieldPattern",
                          "field": {
                            "$type": "Identifier",
                            "id": "message",
                          },
                          "pattern": {
                            "$type": "VariablePattern",
                            "name": {
                              "$type": "Identifier",
                              "id": "msg",
                            },
                          },
                        },
                      ],
                    },
                    "patterns": [],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "unknown",
                  },
                  "pattern": {
                    "$type": "WildcardPattern",
                    "text": "_",
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "result",
              },
            },
          },
        ]
      `);
    });

    it("parses nested match expressions", async () => {
      const statements = await snapshotTest(`
        match (outer) {
          Some(inner) => match (inner) {
            1 => "found one";
            n => "found " + n;
          };
          None => "nothing";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "MatchExpression",
                    "cases": [
                      {
                        "$type": "MatchCase",
                        "body": {
                          "$type": "StringLiteral",
                          "text": "found one",
                        },
                        "pattern": {
                          "$type": "LiteralPattern",
                          "value": {
                            "$type": "IntegerLiteral",
                            "text": "1",
                          },
                        },
                      },
                      {
                        "$type": "MatchCase",
                        "body": {
                          "$type": "BinaryExpression",
                          "left": {
                            "$type": "StringLiteral",
                            "text": "found ",
                          },
                          "operator": {
                            "$type": "AdditionOperator",
                            "text": "+",
                          },
                          "right": {
                            "$type": "Identifier",
                            "id": "n",
                          },
                        },
                        "pattern": {
                          "$type": "VariablePattern",
                          "name": {
                            "$type": "Identifier",
                            "id": "n",
                          },
                        },
                      },
                    ],
                    "target": {
                      "$type": "Identifier",
                      "id": "inner",
                    },
                  },
                  "pattern": {
                    "$type": "ConstructorPattern",
                    "constructor": {
                      "$type": "Identifier",
                      "id": "Some",
                    },
                    "patterns": [
                      {
                        "$type": "VariablePattern",
                        "name": {
                          "$type": "Identifier",
                          "id": "inner",
                        },
                      },
                    ],
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "nothing",
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "None",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "outer",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with boolean literal patterns", async () => {
      const statements = await snapshotTest(`
        match (flag) {
          true => "yes";
          false => "no";
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "yes",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "BooleanLiteral",
                      "text": "true",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "StringLiteral",
                    "text": "no",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "BooleanLiteral",
                      "text": "false",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "flag",
              },
            },
          },
        ]
      `);
    });

    it("parses match expression with string literal patterns", async () => {
      const statements = await snapshotTest(`
        match (status) {
          "pending" => 0;
          "running" => 1;
          "complete" => 2;
          other => 3;
        }
      `);

      expect(statements).toMatchInlineSnapshot(`
        [
          {
            "$type": "ExpressionStatement",
            "expression": {
              "$type": "MatchExpression",
              "cases": [
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "0",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "StringLiteral",
                      "text": "pending",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "1",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "StringLiteral",
                      "text": "running",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "2",
                  },
                  "pattern": {
                    "$type": "LiteralPattern",
                    "value": {
                      "$type": "StringLiteral",
                      "text": "complete",
                    },
                  },
                },
                {
                  "$type": "MatchCase",
                  "body": {
                    "$type": "IntegerLiteral",
                    "text": "3",
                  },
                  "pattern": {
                    "$type": "VariablePattern",
                    "name": {
                      "$type": "Identifier",
                      "id": "other",
                    },
                  },
                },
              ],
              "target": {
                "$type": "Identifier",
                "id": "status",
              },
            },
          },
        ]
      `);
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
