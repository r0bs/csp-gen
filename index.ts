import { readFileSync } from "fs";
import { CspDirectiveKeys, CspKeywords, KeyOnlyDirectives } from "./csp-terms";

/**
 * TypeScript's Object.values(enum) creates an array
 * with values _and_ keys (which are numbers),
 * hence the typecasting later in the code (as string[])
 */
const keyOnlyDirectives = Object.values(KeyOnlyDirectives);
const cspDirectiveNames = Object.values(CspDirectiveKeys);

type CspDirectiveKey = keyof typeof CspDirectiveKeys;

type Source = {
  [k in CspDirectiveKey]: keyof typeof CspKeywords[] | string[];
};

const validateSource = (
  input: unknown
):
  | {
      valid: true;
      source: Source;
    }
  | { valid: false } => {
  const valid =
    typeof input === "object" &&
    Object.keys(input as object).every((key) => {
      // Condition: key is a known directive
      if (!cspDirectiveNames.includes(key)) {
        return false;
      }
      // Condition: When a key is a known key-only-directive, it's value must be an empty array
      if (
        keyOnlyDirectives.includes(key) &&
        ((input as Source)[key as CspDirectiveKey] as string[]).length > 0
      ) {
        return false;
      }
      // Condition: value of known (non key-only) CSP directive must contain only CSP keywords or domain-like strings (more then 3 letters, with at least one dot)
      if (
        (!keyOnlyDirectives.includes(key) &&
          ((input as Source)[key as CspDirectiveKey] as string[]).length ===
            0) ||
        !(input as any)[key as any].every(
          (value: string) =>
            Object.values(CspKeywords).includes(value) ||
            (value.includes(".") && value.length > 3)
        )
      ) {
        return false;
      }
      return true;
    });

  if (!valid) {
    return { valid: false };
  }
  return { valid: true, source: input as Source };
};

const reduceCspObjectToString =
  (source: Source) => (csp: string, directiveKey: string) => {
    const key = directiveKey as CspDirectiveKey;
    if (keyOnlyDirectives.includes(key)) {
      csp += `${key}; `;
    } else {
      csp += `${key} ${(source[key] as string[]).join(" ")}; `;
    }
    return csp;
  };

export const generate = (filepath: string): string => {
  const input = JSON.parse(readFileSync(filepath, "utf-8"));
  const validationResult = validateSource(input);

  if (!validationResult.valid) {
    throw new Error("CSP JSON input not valid!");
  }

  const { source } = validationResult;

  return Object.keys(source).reduce(reduceCspObjectToString(source), "");
};

export default generate;
