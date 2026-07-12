"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { germanIban, mod97 } = require("../src/seed.js");
test("generated IBAN has valid mod-97 checksum", () => {
  const iban = germanIban(1000);                       // e.g. DExx12345678...
  assert.match(iban, /^DE\d{20}$/);
  const rearr = iban.slice(4) + "131400";              // move DE+check to end → D=13,E=14
  const withCheck = iban.slice(4) + "1314" + iban.slice(2, 4);
  assert.strictEqual(mod97(withCheck), 1);             // valid IBAN ⇒ mod97 == 1
});
