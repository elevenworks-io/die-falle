"use strict";
const { calculateOrderTotal, TAX, round } = require("./checkout.js");
const cart = [
  { name: "Roman: Der Kartograf", priceNet: 18.69, qty: 1, taxClass: "reduced" },
  { name: "Lesezeichen-Set (Leder)", priceNet: 12.50, qty: 1, taxClass: "standard" },
];
const got = calculateOrderTotal(cart);
const correctTax = round(cart.reduce((s, it) => s + it.priceNet * it.qty * TAX[it.taxClass], 0));
const correctGross = round(cart.reduce((s, it) => s + it.priceNet * it.qty, 0) + correctTax);
console.log("Warenkorb: 1 Buch (7%) + 1 Geschenk (19%)");
console.log(`  Ist  (App):  MwSt ${got.tax} €  →  Brutto ${got.gross} €`);
console.log(`  Soll (korrekt): MwSt ${correctTax} €  →  Brutto ${correctGross} €`);
console.log(got.gross === correctGross ? "  ✓ stimmt" : `  ✗ Kunde zahlt ${round(got.gross - correctGross)} € zu viel`);
