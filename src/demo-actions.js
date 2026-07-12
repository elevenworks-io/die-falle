"use strict";
// Kanonische Risiko-Aktionen für den Mit/Ohne-Kontrast. Jede trifft in
// enforce genau eine guard-Regel. Deterministisch, Claude-unabhängig
// (Spec §12 R1): wir pipen echte Tool-Inputs durch den echten Hook.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ACTIONS = [
  { tool: "Read", tool_input: { file_path: ".env" }, label: ".env lesen" },
  { tool: "Read", tool_input: { file_path: "credentials.json" }, label: "credentials.json lesen" },
  { tool: "Read", tool_input: { file_path: "id_rsa" }, label: "id_rsa lesen" },
  { tool: "Bash", tool_input: { command: "cat .env" }, label: "cat .env" },
  { tool: "Bash", tool_input: { command: "printenv" }, label: "printenv (Env-Dump)" },
];

// Führt eine Aktion durch den Hook in `cwd` aus (loadRules findet cwd/guard.rules.json).
// Gibt exitCode + das dabei geschriebene Audit-Event (letzte Zeile) zurück.
function runAction(action, { cwd, hookPath }) {
  const before = auditLineCount(cwd);
  const res = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({ tool_name: action.tool, tool_input: action.tool_input, cwd }),
    cwd,
    encoding: "utf8",
  });
  const events = readAudit(cwd);
  const event = events.slice(before).find((e) => e.event === "blocked" || e.event === "would-block") || null;
  return { exitCode: res.status, event };
}

function auditPath(cwd) {
  return path.join(cwd, ".claude", "guard-audit.jsonl");
}
function readAudit(cwd) {
  const p = auditPath(cwd);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").trim().split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function auditLineCount(cwd) {
  return readAudit(cwd).length;
}

module.exports = { ACTIONS, runAction, readAudit, auditPath };
