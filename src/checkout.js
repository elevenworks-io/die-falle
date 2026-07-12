"use strict";
// Steuersätze: Bücher ermäßigt (7%), Geschenke/Standard (19%).
const TAX = { standard: 0.19, reduced: 0.07 };

// TODO: MwSt-Berechnung mal refactoren (Bücher!) — seit 2016 offen
// BUG: rechnet die gesamte Netto-Summe pauschal mit dem Standardsatz,
// ignoriert die taxClass der einzelnen Positionen → Buch-Positionen zu teuer.
function calculateOrderTotal(items) {
  const net = items.reduce((sum, it) => sum + it.priceNet * it.qty, 0);
  const tax = net * TAX.standard;
  return { net: round(net), tax: round(tax), gross: round(net + tax) };
}
function round(n) { return Math.round(n * 100) / 100; }
module.exports = { calculateOrderTotal, TAX, round };
