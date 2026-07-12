"use strict";
const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "shop.sqlite");

function open() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return new DatabaseSync(DB_PATH);
}
const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, priceNet REAL, taxClass TEXT);
CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, street TEXT, zip TEXT, city TEXT, phone TEXT, iban TEXT);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customerId INTEGER, createdAt TEXT);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY, orderId INTEGER, productId INTEGER, qty INTEGER);
CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY, orderId INTEGER, net REAL, tax REAL, gross REAL);
`;
module.exports = { open, DB_PATH, DATA_DIR, SCHEMA };
