const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const itemBank = JSON.parse(fs.readFileSync(path.join(outputDir, "item_bank.json"), "utf8"));
const items = itemBank.items || [];

const sections = [
  { key: "A", label: "Reading Synthesis", start: 1, end: 100, minutes: 90, breakAfterMinutes: 10 },
  { key: "B", label: "Use of Academic English", start: 101, end: 200, minutes: 90, breakAfterMinutes: 10 },
  { key: "C", label: "Data Interpretation", start: 201, end: 300, minutes: 90, breakAfterMinutes: 0 }
].map((section) => {
  const sectionItems = items.filter((item) => item.category === section.key);
  return {
    ...section,
    itemCount: sectionItems.length,
    firstItem: sectionItems[0]?.id || null,
    lastItem: sectionItems[sectionItems.length - 1]?.id || null,
    complete: sectionItems.length === 100
  };
});

const checks = [
  { name: "three-section-blueprint", status: sections.length === 3 ? "pass" : "fail" },
  { name: "section-item-counts", status: sections.every((section) => section.complete) ? "pass" : "fail" },
  { name: "timed-sections", status: sections.every((section) => section.minutes === 90) ? "pass" : "fail" },
  { name: "breaks-after-a-b", status: sections[0].breakAfterMinutes === 10 && sections[1].breakAfterMinutes === 10 && sections[2].breakAfterMinutes === 0 ? "pass" : "fail" },
  { name: "final-protocol", status: items.length === 300 ? "pass" : "fail" }
];

const failures = checks.filter((check) => check.status !== "pass");
const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: itemBank.bankVersion,
  schemaVersion: itemBank.schemaVersion,
  status: failures.length ? "exam-protocol-fail" : "exam-protocol-ready",
  totalItems: items.length,
  totalWorkingMinutes: sections.reduce((sum, section) => sum + section.minutes, 0),
  totalBreakMinutes: sections.reduce((sum, section) => sum + section.breakAfterMinutes, 0),
  requiredRuntimeState: ["acc_exam_breaks", "session.examProtocol"],
  sections,
  checks,
  failures
};

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const matrixRows = [
  ["section", "label", "start", "end", "minutes", "break_after_minutes", "item_count", "first_item", "last_item", "complete"],
  ...sections.map((section) => [
    section.key,
    section.label,
    section.start,
    section.end,
    section.minutes,
    section.breakAfterMinutes,
    section.itemCount,
    section.firstItem,
    section.lastItem,
    section.complete
  ])
];

fs.writeFileSync(path.join(outputDir, "exam_protocol_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "exam_protocol_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ bankVersion: report.bankVersion, status: report.status, sections: report.sections.length }, null, 2));
