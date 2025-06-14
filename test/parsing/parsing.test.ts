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
                    "$type": "NumberLiteral",
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
                "$type": "NumberLiteral",
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
                "$type": "NumberLiteral",
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
                    "$type": "NumberLiteral",
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
                "$type": "NumberLiteral",
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
                    "$type": "NumberLiteral",
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
                "$type": "NumberLiteral",
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
                    "$type": "NumberLiteral",
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
                    "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
              "$type": "NumberLiteral",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "b",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                "$type": "NumberLiteral",
                "text": "42",
              },
              "parameters": [],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                      "$type": "NumberLiteral",
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
                        "$type": "PrimitiveType",
                        "name": "Number",
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
                      "$type": "NumberLiteral",
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
                        "$type": "PrimitiveType",
                        "name": "Number",
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
                      "$type": "PrimitiveType",
                      "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
                {
                  "$type": "FunctionTypeParameter",
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
                {
                  "$type": "ParameterDeclaration",
                  "name": {
                    "$type": "Identifier",
                    "id": "y",
                  },
                  "type": {
                    "$type": "PrimitiveType",
                    "name": "Number",
                  },
                },
              ],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                "$type": "PrimitiveType",
                "name": "Number",
              },
            },
            "value": {
              "$type": "FunctionExpression",
              "body": {
                "$type": "NumberLiteral",
                "text": "42",
              },
              "parameters": [],
              "returnType": {
                "$type": "PrimitiveType",
                "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                    "$type": "PrimitiveType",
                    "name": "Number",
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
          return x;
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
                    "$type": "Identifier",
                    "id": "x",
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
                        "$type": "PrimitiveType",
                        "name": "Number",
                      },
                    },
                    {
                      "$type": "FunctionTypeParameter",
                      "type": {
                        "$type": "PrimitiveType",
                        "name": "Number",
                      },
                    },
                  ],
                  "returnType": {
                    "$type": "PrimitiveType",
                    "name": "Number",
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
                  "$type": "PrimitiveType",
                  "name": "Number",
                },
              },
              {
                "$type": "ParameterDeclaration",
                "name": {
                  "$type": "Identifier",
                  "id": "y",
                },
                "type": {
                  "$type": "PrimitiveType",
                  "name": "Number",
                },
              },
            ],
            "returnType": {
              "$type": "PrimitiveType",
              "name": "Number",
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
