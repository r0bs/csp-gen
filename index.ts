import { readFileSync } from "fs";

enum CspKeywords {
  "'none'",
  "'report-sample'",
  "'self'",
  "'strict-dynamic'",
  "'unsafe-allow-redirects'",
  "'unsafe-eval'",
  "'unsafe-hashes'",
  "'unsafe-inline'",
  "data:",
}

enum CspDirectiveKeys {
  "base-uri",
  "block-all-mixed-content",
  "connect-src",
  "default-src",
  "font-src",
  "form-action",
  "frame-ancestors",
  "frame-src",
  "img-src",
  "manifest-src",
  "media-src",
  "navigate-to",
  "object-src",
  "plugin-types",
  "prefetch-src",
  "report-to",
  "report-uri",
  "require-sri-for",
  "require-trusted-types-for",
  "sandbox",
  "script-src-attr",
  "script-src-elem",
  "script-src",
  "style-src-attr",
  "style-src-elem",
  "style-src",
  "trusted-types",
  "upgrade-insecure-requests",
  "worker-src",
}

enum KeyOnlyDirectives {
  "block-all-mixed-content",
  "upgrade-insecure-requests",
}

/**
 * TypeScript's Object.values(enum) creates an array
 * with values _and_ keys (which are numbers),
 * hence the typecasting later in the code (as string[])
 */
const keyOnlyDirectives = Object.values(KeyOnlyDirectives);
const cspDirectiveNames = Object.values(CspDirectiveKeys);

type CspDirectiveKey = keyof typeof CspDirectiveKeys;

export type CspSource = {
  [k in CspDirectiveKey]?: keyof typeof CspKeywords[] | string[];
};

const validateSource = (
  input: unknown
):
  | {
      valid: true;
      source: CspSource;
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
      if (keyOnlyDirectives.includes(key) && ((input as CspSource)[key as CspDirectiveKey] as string[]).length > 0) {
        return false;
      }
      // Condition: value of known (non key-only) CSP directive must contain only CSP keywords or domain-like strings (more then 3 letters, with at least one dot)
      if (
        (!keyOnlyDirectives.includes(key) && ((input as CspSource)[key as CspDirectiveKey] as string[]).length === 0) ||
        !(input as any)[key as any].every(
          (value: string) => Object.values(CspKeywords).includes(value) || (value.includes(".") && value.length > 3)
        )
      ) {
        return false;
      }
      return true;
    });

  if (!valid) {
    return { valid: false };
  }
  return { valid: true, source: input as CspSource };
};

const reduceCspObjectToString = (source: CspSource) => (csp: string, directiveKey: string) => {
  const key = directiveKey as CspDirectiveKey;
  if (keyOnlyDirectives.includes(key)) {
    csp += `${key}; `;
  } else {
    csp += `${key} ${(source[key] as string[]).join(" ")}; `;
  }
  return csp;
};

export const generate = (input: CspSource): string => {
  const validationResult = validateSource(input);

  if (!validationResult.valid) {
    throw new Error("CSP JSON input not valid!");
  }

  const { source } = validationResult;

  return Object.keys(source).reduce(reduceCspObjectToString(source), "");
};

export default generate;
