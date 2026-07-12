"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { calculateOrderTotal, TAX, round } = require("../src/checkout.js");
const mixed = [
  { priceNet: 18.69, qty: 1, taxClass: "reduced" },
  { priceNet: 12.50, qty: 1, taxClass: "standard" },
];
test("KNOWN BUG (demo target): mixed cart is overtaxed at flat 19%", () => {
  const got = calculateOrderTotal(mixed);
  const flat = round((18.69 + 12.50) * TAX.standard);
  assert.strictEqual(got.tax, flat);           // aktueller (falscher) Zustand
  const correct = round(18.69 * TAX.reduced + 12.50 * TAX.standard);
  assert.notStrictEqual(got.tax, correct);     // beweist: Buch wird überbesteuert
});
