"use strict";
const express = require("express");
const path = require("node:path");
const { open } = require("./db.js");
const { calculateOrderTotal } = require("./checkout.js");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/products", (req, res) => {
  const db = open(); const rows = db.prepare("SELECT * FROM products").all(); db.close(); res.json(rows);
});
app.post("/api/orders", (req, res) => {
  const { customerId, items } = req.body; // items: [{productId, qty}]
  const db = open();
  const prods = db.prepare("SELECT * FROM products").all();
  const enriched = items.map((it) => { const p = prods.find((x) => x.id === it.productId); return { ...p, qty: it.qty }; });
  const total = calculateOrderTotal(enriched);
  const now = new Date().toISOString();
  const oid = db.prepare("INSERT INTO orders (customerId,createdAt) VALUES (?,?)").run(customerId, now).lastInsertRowid;
  const insItem = db.prepare("INSERT INTO order_items (orderId,productId,qty) VALUES (?,?,?)");
  items.forEach((it) => insItem.run(oid, it.productId, it.qty));
  db.prepare("INSERT INTO invoices (orderId,net,tax,gross) VALUES (?,?,?,?)").run(oid, total.net, total.tax, total.gross);
  db.close();
  res.json({ orderId: oid, ...total });
});
app.get("/api/orders", (req, res) => {
  const db = open();
  const rows = db.prepare(`SELECT o.id, o.createdAt, c.name customer, i.net, i.tax, i.gross
    FROM orders o JOIN customers c ON c.id=o.customerId JOIN invoices i ON i.orderId=o.id ORDER BY o.id DESC`).all();
  db.close(); res.json(rows);
});
const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`Buchstäblich GmbH läuft auf http://localhost:${PORT}`));
module.exports = { app };
