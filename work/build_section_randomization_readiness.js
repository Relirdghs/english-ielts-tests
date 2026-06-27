const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const itemBank = JSON.parse(fs.readFileSync(path.join(outputDir, "item_bank.json"), "utf8"));
const html = fs.readFileSync(path.join(outputDir, "academic_test_platform.html"), "utf8");
const items = itemBank.items || [];

function seededRank(value, seed, salt = 0) {
  const raw = Math.sin((value + 1) * 999 + seed + salt) * 10000;
  return raw - Math.floor(raw);
}

function orderedIndices(indices, seed, salt = 0) {
  return [...indices].sort((a, b) => seededRank(a, seed, salt) - seededRank(b, seed, salt));
}

const sections = ["A", "B", "C"].map((key) => {
  const original = items.map((item, idx) => item.category === key ? idx : -1).filter((idx) => idx >= 0);
  const randomized = orderedIndices(original, 20260626, 5100 + key.charCodeAt(0));
  return {
    key,
    itemCount: original.length,
    firstPosition: key === "A" ? 1 : key === "B" ? 101 : 201,
    lastPosition: key === "A" ? 100 : key === "B" ? 200 : 300,
    firstItem: items[randomized[0]]?.id || null,
    lastItem: items[randomized[randomized.length - 1]]?.id || null,
    orderChanged: randomized.some((idx, order) => idx !== original[order])
  };
});

const checks = [
  { name: "runtime-section-randomizer", status: /function orderedSectionIndices/.test(html) ? "pass" : "fail" },
  { name: "runtime-order-snapshot", status: /function questionOrderSnapshot/.test(html) && /questionOrder: questionOrderSnapshot/.test(html) ? "pass" : "fail" },
  { name: "section-boundaries", status: sections.every((section) => section.itemCount === 100) ? "pass" : "fail" },
  { name: "order-changes-inside-sections", status: sections.every((section) => section.orderChanged) ? "pass" : "fail" },
  { name: "candidate-copy", status: /shuffles items inside sections/.test(html) ? "pass" : "fail" }
];

const failures = checks.filter((check) => check.status !== "pass");
const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: itemBank.bankVersion,
  schemaVersion: itemBank.schemaVersion,
  status: failures.length ? "section-randomization-fail" : "section-randomization-ready",
  seedPolicy: "deterministic per attempt through acc_random_seed",
  preservationRule: "Randomized full-exam order must keep A positions 1-100, B positions 101-200 and C positions 201-300.",
  sections,
  runtimeState: ["acc_random_questions", "acc_random_seed", "session.questionOrder"],
  checks,
  failures
};

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const rows = [
  ["section", "item_count", "first_position", "last_position", "first_random_item", "last_random_item", "order_changed"],
  ...sections.map((section) => [section.key, section.itemCount, section.firstPosition, section.lastPosition, section.firstItem, section.lastItem, section.orderChanged])
];

fs.writeFileSync(path.join(outputDir, "section_randomization_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "section_randomization_matrix.csv"), rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");
console.log(JSON.stringify({ bankVersion: report.bankVersion, status: report.status, checks: checks.length }, null, 2));
