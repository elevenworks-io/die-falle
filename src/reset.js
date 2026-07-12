"use strict";
// Stellt den Pristine-Demo-Zustand her: DB neu seeden, Audit-Log leeren,
// von Claude editierte (getrackte) Dateien via git zurücksetzen.
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { seed } = require("./seed.js");

const root = path.join(__dirname, "..");
const audit = path.join(root, ".claude", "guard-audit.jsonl");
try { fs.rmSync(audit, { force: true }); } catch {}
try { execSync("git checkout -- .", { cwd: root, stdio: "ignore" }); } catch {}
const r = seed();
fs.rmSync(path.join(root, "guard-report.md"), { force: true });
console.log(`Reset: DB neu geseedet (${r.products} Produkte, ${r.customers} Kund:innen), Audit-Log geleert, getrackte Dateien zurückgesetzt.`);
