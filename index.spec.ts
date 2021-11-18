import { expect } from "chai";
import { generate } from ".";

describe("index", () => {
  it("generates a pretty standard secure csp", () => {
    const csp = generate("./test/mixed-directives.json");
    expect(csp).to.equal(
      "base-uri 'none'; block-all-mixed-content; connect-src 'self' api.r0bs.net; default-src api.xs2a.com; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' *.foo.bar; manifest-src 'self'; media-src 'none'; navigate-to 'self' r0bs.net; object-src 'none'; script-src 'self' www.r0bs.net; style-src 'self'; worker-src 'none'; "
    );
  });

  it("failes validation because of empty standard directive", () => {
    expect(() => generate("./test/empty-directive.json")).to.throw();
  });

  it("failes validation because of empty a non empty key only directive", () => {
    expect(() => generate("./test/non-empty-key-only-directive.json")).to.throw();
  });

  it("failes because directive is not known", () => {
    expect(() => generate("./test/wrong-key.json")).to.throw();
  });

  it("failes because of a wrong value in a standard directive", () => {
    expect(() => generate("./test/wrong-value.json")).to.throw();
  });
});
