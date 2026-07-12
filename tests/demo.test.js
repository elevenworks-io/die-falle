"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { ACTIONS, runAction, readAudit } = require("../src/demo-actions.js");

const HOOK = path.join(__dirname, "..", ".claude", "hooks", "guard", "pretool.js");
const RULES = path.join(__dirname, "..", "guard.rules.json");

function tally(mode) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "df-demo-"));
  const rules = JSON.parse(fs.readFileSync(RULES, "utf8"));
  rules.mode = mode;
  fs.writeFileSync(path.join(cwd, "guard.rules.json"), JSON.stringify(rules));
  const results = ACTIONS.map((a) => runAction(a, { cwd, hookPath: HOOK }));
  const events = readAudit(cwd);
  fs.rmSync(cwd, { recursive: true, force: true });
  return {
    blocked: results.filter((r) => r.exitCode === 2).length,
    passed: results.filter((r) => r.exitCode === 0).length,
    wouldBlockEvents: events.filter((e) => e.event === "would-block").length,
    blockedEvents: events.filter((e) => e.event === "blocked").length,
  };
}

test("enforce: alle Risiko-Aktionen werden geblockt", () => {
  const t = tally("enforce");
  assert.strictEqual(t.blocked, ACTIONS.length, "alle sollten exit 2 liefern");
  assert.strictEqual(t.blockedEvents, ACTIONS.length);
  assert.strictEqual(t.wouldBlockEvents, 0);
});

test("monitor: 0 geblockt, alle als would-block erkannt + durchgelassen", () => {
  const t = tally("monitor");
  assert.strictEqual(t.blocked, 0, "monitor blockt nichts");
  assert.strictEqual(t.passed, ACTIONS.length);
  assert.strictEqual(t.wouldBlockEvents, ACTIONS.length);
  assert.strictEqual(t.blockedEvents, 0);
});
