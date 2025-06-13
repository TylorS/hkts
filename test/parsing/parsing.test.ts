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
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "StringLiteral",
                      "value": "Hello, World!",
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
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
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "NumberLiteral",
                      "value": "123",
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
          },
        },
      ]
    `);
  });

  it("parses boolean literal true", async () => {
    const statements = await snapshotTest(`
        true
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "BooleanLiteral",
                      "value": "true",
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
          },
        },
      ]
    `);
  });

  it("parses boolean literal false", async () => {
    const statements = await snapshotTest(`
        false
    `);

    expect(statements).toMatchInlineSnapshot(`
      [
        {
          "$type": "ExpressionStatement",
          "expression": {
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "BooleanLiteral",
                      "value": "false",
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
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
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "ArrayLiteral",
                      "elements": [
                        {
                          "$type": "PipelineExpression",
                          "left": {
                            "$type": "AssignmentExpression",
                            "left": {
                              "$type": "BinaryExpression",
                              "left": {
                                "$type": "UnaryExpression",
                                "expression": {
                                  "$type": "PostfixExpression",
                                  "base": {
                                    "$type": "NumberLiteral",
                                    "value": "1",
                                  },
                                  "postfixes": [],
                                },
                              },
                            },
                          },
                          "rights": [],
                        },
                        {
                          "$type": "PipelineExpression",
                          "left": {
                            "$type": "AssignmentExpression",
                            "left": {
                              "$type": "BinaryExpression",
                              "left": {
                                "$type": "UnaryExpression",
                                "expression": {
                                  "$type": "PostfixExpression",
                                  "base": {
                                    "$type": "NumberLiteral",
                                    "value": "2",
                                  },
                                  "postfixes": [],
                                },
                              },
                            },
                          },
                          "rights": [],
                        },
                        {
                          "$type": "PipelineExpression",
                          "left": {
                            "$type": "AssignmentExpression",
                            "left": {
                              "$type": "BinaryExpression",
                              "left": {
                                "$type": "UnaryExpression",
                                "expression": {
                                  "$type": "PostfixExpression",
                                  "base": {
                                    "$type": "NumberLiteral",
                                    "value": "3",
                                  },
                                  "postfixes": [],
                                },
                              },
                            },
                          },
                          "rights": [],
                        },
                      ],
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
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
            "$type": "PipelineExpression",
            "left": {
              "$type": "AssignmentExpression",
              "left": {
                "$type": "BinaryExpression",
                "left": {
                  "$type": "UnaryExpression",
                  "expression": {
                    "$type": "PostfixExpression",
                    "base": {
                      "$type": "ObjectLiteral",
                      "properties": [
                        {
                          "$type": "PropertyAssignment",
                          "name": {
                            "$type": "Identifier",
                            "name": "name",
                          },
                          "value": {
                            "$type": "PipelineExpression",
                            "left": {
                              "$type": "AssignmentExpression",
                              "left": {
                                "$type": "BinaryExpression",
                                "left": {
                                  "$type": "UnaryExpression",
                                  "expression": {
                                    "$type": "PostfixExpression",
                                    "base": {
                                      "$type": "StringLiteral",
                                      "value": "John",
                                    },
                                    "postfixes": [],
                                  },
                                },
                              },
                            },
                            "rights": [],
                          },
                        },
                        {
                          "$type": "PropertyAssignment",
                          "name": {
                            "$type": "Identifier",
                            "name": "age",
                          },
                          "value": {
                            "$type": "PipelineExpression",
                            "left": {
                              "$type": "AssignmentExpression",
                              "left": {
                                "$type": "BinaryExpression",
                                "left": {
                                  "$type": "UnaryExpression",
                                  "expression": {
                                    "$type": "PostfixExpression",
                                    "base": {
                                      "$type": "NumberLiteral",
                                      "value": "30",
                                    },
                                    "postfixes": [],
                                  },
                                },
                              },
                            },
                            "rights": [],
                          },
                        },
                      ],
                    },
                    "postfixes": [],
                  },
                },
              },
            },
            "rights": [],
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
          "body": {
            "$type": "Block",
            "statements": [
              {
                "$type": "ReturnStatement",
                "expression": {
                  "$type": "PipelineExpression",
                  "left": {
                    "$type": "AssignmentExpression",
                    "left": {
                      "$type": "BinaryExpression",
                      "left": {
                        "$type": "UnaryExpression",
                        "expression": {
                          "$type": "PostfixExpression",
                          "base": {
                            "$type": "StringLiteral",
                            "value": "Hello, ",
                          },
                          "postfixes": [],
                        },
                      },
                      "operator": "+",
                      "right": {
                        "$type": "UnaryExpression",
                        "expression": {
                          "$type": "PostfixExpression",
                          "base": {
                            "$type": "Identifier",
                            "name": "name",
                          },
                          "postfixes": [],
                        },
                      },
                    },
                  },
                  "rights": [],
                },
              },
            ],
          },
          "name": "greet",
          "parameters": [
            {
              "$type": "Parameter",
              "name": "name",
              "typeAnnotation": {
                "$type": "TypeAnnotation",
                "type": {
                  "$type": "UnionType",
                  "types": [
                    {
                      "$type": "IntersectionType",
                      "types": [
                        {
                          "$type": "PostfixType",
                          "base": {
                            "$type": "StringType",
                          },
                          "postfixes": [],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
          "returnType": {
            "$type": "TypeAnnotation",
            "type": {
              "$type": "UnionType",
              "types": [
                {
                  "$type": "IntersectionType",
                  "types": [
                    {
                      "$type": "PostfixType",
                      "base": {
                        "$type": "StringType",
                      },
                      "postfixes": [],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]
    `);
  });

  async function snapshotTest(source: string) {
    const document = await parse(source);

    expect(checkDocumentValid(document)).toBeUndefined();

    return document.parseResult.value.statements.map(
      recursivelyRemoveCircularReferences
    );
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
