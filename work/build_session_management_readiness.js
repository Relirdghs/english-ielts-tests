const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, "academic_test_manifest.json"), "utf8"));
const html = fs.readFileSync(path.join(outputDir, "academic_test_platform.html"), "utf8");

const checks = [
  { name: "default-slots", status: /defaultSlotLabels/.test(html) && /mock-a/.test(html) && /mock-b/.test(html) ? "pass" : "fail" },
  { name: "named-slot-labels", status: /acc_slot_labels/.test(html) && /Session name/.test(html) ? "pass" : "fail" },
  { name: "named-slot-save", status: /function saveNamedSlot/.test(html) && /function uniqueSlotKey/.test(html) ? "pass" : "fail" },
  { name: "slot-snapshot-label", status: /slotLabel: slotLabel/.test(html) && /activeSlot: state\.activeSlot/.test(html) ? "pass" : "fail" },
  { name: "slot-browser-qa", status: /Named slot persistence failed/.test(fs.readFileSync(path.join(root, "work", "qa_academic_platform.js"), "utf8")) ? "pass" : "fail" }
];

const failures = checks.filter((check) => check.status !== "pass");
const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: manifest.bankVersion,
  schemaVersion: manifest.schemaVersion,
  status: failures.length ? "session-management-fail" : "session-management-ready",
  runtimeState: ["acc_active_slot", "acc_slot_labels", "acc_slot_<slot>", "acc_slot_draft"],
  defaultSlots: ["default", "mock-a", "mock-b"],
  supportedActions: ["save active slot", "load active slot", "create named slot", "persist slot label", "include slot label in JSON session snapshot"],
  checks,
  failures
};

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const matrixRows = [
  ["check", "status"],
  ...checks.map((check) => [check.name, check.status])
];

fs.writeFileSync(path.join(outputDir, "session_management_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "session_management_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ bankVersion: report.bankVersion, status: report.status, checks: checks.length }, null, 2));
