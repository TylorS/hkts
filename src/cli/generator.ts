import { expandToNode, joinToNode, toString } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import { extractDestinationAndName } from "./cli-util.js";
import type {
  Comment,
  DataDeclaration,
  EffectDeclaration,
  ExpressionStatement,
  FunctionDeclaration,
  IfStatement,
  InstanceDeclaration,
  LetDeclaration,
  MultiLineComment,
  ReturnStatement,
  SourceFile,
  Statement,
  TypeAliasDeclaration,
  TypeclassDeclaration,
} from "../language/generated/ast.js";

export function generateJavaScript(
  sourceFile: SourceFile,
  filePath: string,
  destination: string | undefined
): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  const fileNode = expandToNode`
        "use strict";
        ${joinToNode(sourceFile.statements, generateStatement, {
          appendNewLineIfNotEmpty: true,
        })}
    `.appendNewLineIfNotEmpty();

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }
  fs.writeFileSync(generatedFilePath, toString(fileNode));
  return generatedFilePath;
}

function generateStatement(statement: Statement) {
  switch (statement.$type) {
    case "Comment":
      return generateComment(statement);
    case "DataDeclaration":
      return generateDataDeclaration(statement);
    case "EffectDeclaration":
      return generateEffectDeclaration(statement);
    case "ExpressionStatement":
      return generateExpressionStatement(statement);
    case "FunctionDeclaration":
      return generateFunctionDeclaration(statement);
    case "IfStatement":
      return generateIfStatement(statement);
    case "InstanceDeclaration":
      return generateInstanceDeclaration(statement);
    case "LetDeclaration":
      return generateLetDeclaration(statement);
    case "MultiLineComment":
      return generateMultiLineComment(statement);
    case "ReturnStatement":
      return generateReturnStatement(statement);
    case "TypeAliasDeclaration":
      return generateTypeAliasDeclaration(statement);
    case "TypeclassDeclaration":
      return generateTypeclassDeclaration(statement);
    default:
      throw new Error(`Unknown statement type: ${JSON.stringify(statement)}`);
  }
}

function generateComment(statement: Comment) {
  return `// ${statement.text}`;
}

function generateDataDeclaration(statement: DataDeclaration) {
  return "";
}

function generateEffectDeclaration(statement: EffectDeclaration) {
  return "";
}

function generateExpressionStatement(statement: ExpressionStatement) {
  return "";
}

function generateFunctionDeclaration(statement: FunctionDeclaration) {
  return "";
}

function generateIfStatement(statement: IfStatement) {
  return "";
}

function generateInstanceDeclaration(statement: InstanceDeclaration) {
  return "";
}

function generateLetDeclaration(statement: LetDeclaration) {
  return "";
}

function generateMultiLineComment(statement: MultiLineComment) {
  return "";
}

function generateReturnStatement(statement: ReturnStatement) {
  return "";
}

function generateTypeAliasDeclaration(statement: TypeAliasDeclaration) {
  return "";
}

function generateTypeclassDeclaration(statement: TypeclassDeclaration) {
  return "";
}
