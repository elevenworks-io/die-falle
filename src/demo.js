"use strict";
// npm run demo:guarded | demo:unguarded — der quantifizierte Mit/Ohne-Kontrast.
// Setzt guard.rules.json auf enforce/monitor, leert das Audit-Log, replayt die
// kanonischen Risiko-Aktionen durch den echten guard-Hook und druckt das Ergebnis.
// Die erzeugten Events erscheinen live im /monitor (rot vs. gelb).
const fs = require("node:fs");
const path = require("node:path");
const { ACTIONS, runAction, auditPath } = require("./demo-actions.js");

const root = path.join(__dirname, "..");
const arg = process.argv[2];
if (arg !== "guarded" && arg !== "unguarded") {
  console.error("Aufruf: node src/demo.js <guarded|unguarded>");
  process.exit(1);
}
const mode = arg === "guarded" ? "enforce" : "monitor";
const hookPath = path.join(root, ".claude", "hooks", "guard", "pretool.js");
const rulesPath = path.join(root, "guard.rules.json");

// 1) Modus setzen — nur den mode-Wert chirurgisch ersetzen, damit die
// hand-formatierte (git-getrackte) guard.rules.json unverändert bleibt und
// `demo:guarded` sauber nach enforce zurückkehrt (kein Whitespace-Diff im tree).
const rulesSrc = fs.readFileSync(rulesPath, "utf8");
if (!/"mode":\s*"[a-z]+"/.test(rulesSrc)) {
  console.error(`[demo] Kein "mode"-Feld in guard.rules.json gefunden — abgebrochen (sonst liefe die Demo im falschen Modus).`);
  process.exit(1);
}
fs.writeFileSync(rulesPath, rulesSrc.replace(/("mode":\s*)"[a-z]+"/, `$1"${mode}"`));

// 2) Audit-Log leeren, damit der Monitor genau diese Szene zeigt.
fs.rmSync(auditPath(root), { force: true });

// 3) Aktionen replayen.
const results = ACTIONS.map((a) => ({ a, r: runAction(a, { cwd: root, hookPath }) }));
const blocked = results.filter((x) => x.r.exitCode === 2).length;
const passed = results.filter((x) => x.r.exitCode === 0).length;
const n = ACTIONS.length;

// 4) Kontrast drucken.
const line = "─".repeat(52);
console.log("\n" + line);
if (mode === "enforce") {
  console.log(`  🔒 MIT guard (enforce)`);
  console.log(`     ${n} riskante Aktionen versucht · ${blocked} geblockt · ${passed} durchgelassen`);
  console.log(line);
  for (const { a, r } of results) console.log(`     ${r.exitCode === 2 ? "⛔ geblockt " : "…  offen   "} ${a.label}  ${r.event ? "(" + r.event.ruleId + ")" : ""}`);
  console.log(line);
  console.log(`     → Live-Protokoll: http://localhost:3000/monitor  (rote Einträge)`);
  console.log(`     → Nachweis:       node ../guard/bin/cli.js report`);
} else {
  console.log(`  🔓 OHNE Enforcement (guard monitor-Modus)`);
  console.log(`     ${n} riskante Aktionen erkannt · 0 verhindert · ${passed} durchgelassen`);
  console.log(line);
  for (const { a, r } of results) console.log(`     ${r.event ? "🟡 erkannt " : "…  offen   "} ${a.label}  ${r.event ? "(" + r.event.ruleId + ")" : ""}`);
  console.log(line);
  console.log(`     → Live-Protokoll: http://localhost:3000/monitor  (gelbe would-block-Einträge)`);
  console.log(`     → Genau diese ${n} Zugriffe hätte guard im enforce-Modus geblockt.`);
  console.log(`     ⚠️  guard steht jetzt im monitor-Modus (kein Enforcement).`);
  console.log(`        Zurückschalten: npm run demo:guarded  oder  npm run reset`);
}
console.log(line + "\n");
