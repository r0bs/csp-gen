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
type CspDirectivePredefinedValue = keyof typeof CspKeywords;

export type CspSource = {
  [k in CspDirectiveKey]?: CspDirectivePredefinedValue[] | string[];
};

const validateSource = (input: unknown): { valid: true; source: CspSource } | { valid: false; errors: string[] } => {
  // Condition: input must be an object
  if (typeof input !== "object") {
    return { valid: false, errors: ["Input must be an object"] };
  }
  const errors = Object.entries(input as object)
    .map((directive) => {
      const [directiveKey, directiveValuesArray] = directive;
      // Condition: key must be a known directive
      if (!cspDirectiveNames.includes(directiveKey)) {
        return `Unknown directive '${directiveKey}'`;
      }
      // Condition: When a key is a known key-only-directive, it's value must be an empty array
      if (keyOnlyDirectives.includes(directiveKey) && directiveValuesArray.length > 0) {
        return `Key-only directive '${directiveKey}' must have an empty array as value`;
      }
      // Condition: value of known (non key-only) CSP directive must contain only CSP keywords or domain-like strings (more then 3 letters, with at least one dot)
      if (
        (!keyOnlyDirectives.includes(directiveKey) && directiveValuesArray.length === 0) ||
        !directiveValuesArray.every((value: string) => Object.values(CspKeywords).includes(value) || (value.includes(".") && value.length > 3))
      ) {
        return `Invalid value for '${directiveKey}'`;
      }
    })
    .filter((error) => error);

  if (errors.length) {
    return { valid: false, errors: errors as string[] };
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
    throw new Error(validationResult.errors.join(", "));
  }

  const { source } = validationResult;

  return Object.keys(source).reduce(reduceCspObjectToString(source), "").trim();
};

export default generate;
