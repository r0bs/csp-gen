"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs_1 = require("fs");
const csp_terms_1 = require("./csp-terms");
const keyOnlyDirectives = Object.values(csp_terms_1.KeyOnlyDirectives);
const cspDirectiveNames = Object.values(csp_terms_1.CspDirectiveKeys);
const validateSource = (input) => {
    const valid = typeof input === "object" &&
        Object.keys(input).every((key) => {
            if (!cspDirectiveNames.includes(key)) {
                return false;
            }
            if (keyOnlyDirectives.includes(key) &&
                input[key].length > 0) {
                return false;
            }
            if ((!keyOnlyDirectives.includes(key) &&
                input[key].length ===
                    0) ||
                !input[key].every((value) => Object.values(csp_terms_1.CspKeywords).includes(value) ||
                    (value.includes(".") && value.length > 3))) {
                return false;
            }
            return true;
        });
    if (!valid) {
        return { valid: false };
    }
    return { valid: true, source: input };
};
const reduceCspObjectToString = (source) => (csp, directiveKey) => {
    const key = directiveKey;
    if (keyOnlyDirectives.includes(key)) {
        csp += `${key}; `;
    }
    else {
        csp += `${key} ${source[key].join(" ")}; `;
    }
    return csp;
};
const generate = (filepath) => {
    const input = JSON.parse((0, fs_1.readFileSync)(filepath, "utf-8"));
    const validationResult = validateSource(input);
    if (!validationResult.valid) {
        throw new Error("CSP JSON input not valid!");
    }
    const { source } = validationResult;
    return Object.keys(source).reduce(reduceCspObjectToString(source), "");
};
exports.generate = generate;
exports.default = exports.generate;
