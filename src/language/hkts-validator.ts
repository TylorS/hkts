import type { ValidationChecks } from "langium";
import type { HigherKindedTypeScriptAstType } from "./generated/ast.js";
import type { HigherKindedTypeScriptServices } from "./hkts-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(
  services: HigherKindedTypeScriptServices
) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.HigherKindedTypeScriptValidator;
  const checks: ValidationChecks<HigherKindedTypeScriptAstType> = {};
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class HigherKindedTypeScriptValidator {}

