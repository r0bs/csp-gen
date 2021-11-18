# csp-gen

csp-gen generates a valid csp string from a JSON file

## Installation

Using npm:

```shell
$ npm i csp-gen --save
```

## Usage by example

For a JSON file (let's save it in the project folder as `csp.json`

```json
{
  "connect-src": ["'self'", "api.example.com"],
  "default-src": ["'none'"],
  "font-src": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "frame-src": ["'none'"],
  "img-src": ["'self'", "*.example.com"]
}
```

In Node.js run:

```js
var csp = require("csp-gen");

const policyString = csp.generate("./csp.json");
```

`policyString` will look like this

```text
connect-src 'self' api.example.com; default-src 'none'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' *.example.com;
```

## Why csp-gen?

csp-gen is a dependency-free library that checks the input file for supported CSP terminology (see below) and generates a ready-to-use policy string

- Checks for typos & errors in input files
- 0 dependencies (no transitional pulling of npm packages)
- Creates ready-to-use Content-Security-Policy

## Checks

csp-gen runs checks on the input file and throws an error if input does not match with what can be a valid Content-Security-Policy

### Allowed directive names:

- base-uri
- block-all-mixed-content
- connect-src
- default-src
- font-src
- form-action
- frame-ancestors
- frame-src
- img-src
- manifest-src
- media-src
- navigate-to
- object-src
- plugin-types
- prefetch-src
- report-to
- report-uri
- require-sri-for
- require-trusted-types-for
- sandbox
- script-src-attr
- script-src-elem
- script-src
- style-src-attr
- style-src-elem
- style-src
- trusted-types
- upgrade-insecure-requests
- worker-src

### Allowed directive values:

- every _domain-like_ string (needs to be more than 3 charaters long & contain at least one dot)
- 'none'
- 'report-sample'
- 'self'
- 'strict-dynamic'
- 'unsafe-allow-redirects'
- 'unsafe-eval'
- 'unsafe-hashes'
- 'unsafe-inline'
- data:

### Exceptions:

The following directives must not contain values (for the input JSON those can be added as `directive: []` e.g. `upgrade-insecure-requests: []`

- upgrade-insecure-requests
- block-all-mixed-content
