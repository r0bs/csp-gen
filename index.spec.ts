import { expect } from "chai";
import { generate } from ".";
import { readFileSync } from "fs";

describe("index", () => {
  it("generates a short csp", () => {
    const csp = generate(JSON.parse(readFileSync("./test/one-directive.json", "utf-8")));
    expect(csp).to.equal(
      "script-src 'self' www.example.com; "
    );
  });  
  
  it("generates a pretty standard secure csp", () => {
    const csp = generate(JSON.parse(readFileSync("./test/mixed-directives.json", "utf-8")));
    expect(csp).to.equal(
      "connect-src 'self' api.example.com; default-src 'none'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' *.example.com; manifest-src 'self'; media-src 'none'; navigate-to 'self' example.com; object-src 'none'; script-src 'self' www.example.com; style-src 'self'; worker-src 'none'; "
    );
  });

  it("failes validation because of empty standard directive", () => {
    expect(() => generate(JSON.parse(readFileSync("./test/empty-directive.json", "utf-8")))).to.throw();
  });

  it("failes validation because of empty a non empty key only directive", () => {
    expect(() =>
      generate(JSON.parse(readFileSync("./test/non-empty-keyonly-directive.json", "utf-8")))
    ).to.throw();
  });

  it("failes because directive is not known", () => {
    expect(() => generate(JSON.parse(readFileSync("./test/wrong-key.json", "utf-8")))).to.throw();
  });

  it("failes because of a wrong value in a standard directive", () => {
    expect(() => generate(JSON.parse(readFileSync("./test/wrong-value.json", "utf-8")))).to.throw();
  });
});
