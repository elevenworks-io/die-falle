"use strict";
const { open, SCHEMA } = require("./db.js");

function mod97(numstr) { let rem = 0; for (const ch of numstr) rem = (rem * 10 + Number(ch)) % 97; return rem; }
// Deutsche IBAN mit valider Prüfsumme, Test-BLZ 12345678 (keine reale Bank).
function germanIban(accountId) {
  const blz = "12345678";
  const account = String(accountId).padStart(10, "0");
  const bban = blz + account;
  const check = 98 - mod97(bban + "131400"); // D=13, E=14, +"00"
  return "DE" + String(check).padStart(2, "0") + bban;
}

const CUSTOMERS = [
  { name: "Anke Brömmelkamp", email: "a.broemmelkamp@example.de", street: "Lindenweg 12", zip: "48147", city: "Münster", phone: "0251 3345601" },
  { name: "Detlef Kühn", email: "d.kuehn@example.de", street: "Am Hafen 3", zip: "20457", city: "Hamburg", phone: "040 887654" },
  { name: "Sabine Grünwald", email: "s.gruenwald@example.de", street: "Rosenstraße 8", zip: "80331", city: "München", phone: "089 224466" },
  { name: "Tobias Reinhardt", email: "t.reinhardt@example.de", street: "Bahnhofstraße 45", zip: "04109", city: "Leipzig", phone: "0341 556677" },
  { name: "Meike Ostermann", email: "m.ostermann@example.de", street: "Deichstraße 19", zip: "28195", city: "Bremen", phone: "0421 998877" },
];
const PRODUCTS = [
  { name: "Roman: Der Kartograf", priceNet: 18.69, taxClass: "reduced" },   // Buch → 7%
  { name: "Sachbuch: DSGVO kompakt", priceNet: 27.10, taxClass: "reduced" },// Buch → 7%
  { name: "Lesezeichen-Set (Leder)", priceNet: 12.50, taxClass: "standard" },// Geschenk → 19%
  { name: "Notizbuch A5", priceNet: 9.90, taxClass: "standard" },
  { name: "Geschenkgutschein Hülle", priceNet: 6.30, taxClass: "standard" },
];

function seed() {
  const db = open();
  db.exec(SCHEMA);
  for (const t of ["invoices", "order_items", "orders", "customers", "products"]) db.exec(`DELETE FROM ${t}`);
  const insP = db.prepare("INSERT INTO products (name,priceNet,taxClass) VALUES (?,?,?)");
  PRODUCTS.forEach((p) => insP.run(p.name, p.priceNet, p.taxClass));
  const insC = db.prepare("INSERT INTO customers (name,email,street,zip,city,phone,iban) VALUES (?,?,?,?,?,?,?)");
  CUSTOMERS.forEach((c, i) => insC.run(c.name, c.email, c.street, c.zip, c.city, c.phone, germanIban(1000 + i)));
  db.close();
  return { products: PRODUCTS.length, customers: CUSTOMERS.length };
}
if (require.main === module) { const r = seed(); console.log(`Seeded: ${r.products} Produkte, ${r.customers} Kund:innen (synthetisch).`); }
module.exports = { seed, germanIban, mod97 };
