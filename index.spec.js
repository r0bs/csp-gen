"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const _1 = require(".");
describe("index", () => {
    it("generates a pretty standard secure csp", () => {
        const csp = (0, _1.generate)("./test/mixed-directives.json");
        (0, chai_1.expect)(csp).to.equal("connect-src 'self' api.example.com; default-src 'none'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' *.example.com; manifest-src 'self'; media-src 'none'; navigate-to 'self' example.com; object-src 'none'; script-src 'self' www.example.com; style-src 'self'; worker-src 'none'; ");
    });
    it("failes validation because of empty standard directive", () => {
        (0, chai_1.expect)(() => (0, _1.generate)("./test/empty-directive.json")).to.throw();
    });
    it("failes validation because of empty a non empty key only directive", () => {
        (0, chai_1.expect)(() => (0, _1.generate)("./test/non-empty-key-only-directive.json")).to.throw();
    });
    it("failes because directive is not known", () => {
        (0, chai_1.expect)(() => (0, _1.generate)("./test/wrong-key.json")).to.throw();
    });
    it("failes because of a wrong value in a standard directive", () => {
        (0, chai_1.expect)(() => (0, _1.generate)("./test/wrong-value.json")).to.throw();
    });
});
