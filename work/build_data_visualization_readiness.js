const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");

function readJson(name, fallback = null) {
  const filePath = path.join(outputDir, name);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

const bank = readJson("item_bank.json", { items: [] });
const items = bank.items || [];
const categoryC = items.filter((item) => item.category === "C");

const rows = categoryC.map((item) => {
  const viz = item.dataVisualization || {};
  const series = Array.isArray(viz.series) ? viz.series : [];
  const encodings = new Set(series.map((point) => point.encoding).filter(Boolean));
  return {
    itemId: item.id,
    hasTable: Boolean(item.dataDisplay?.rows?.length),
    hasVisualization: Boolean(viz.type && series.length),
    type: viz.type || "missing",
    seriesCount: series.length,
    hasEstimate: series.some((point) => point.label === "Adjusted estimate"),
    hasSensitivity: series.some((point) => point.label === "Sensitivity model"),
    hasMissingness: series.some((point) => point.label === "Missing/excluded cases"),
    hasAriaLabel: Boolean(viz.ariaLabel),
    encodingCount: encodings.size
  };
});

const failures = [];
if (items.length !== 300) failures.push("item bank does not contain 300 items");
if (categoryC.length !== 100) failures.push("category C does not contain 100 items");
for (const row of rows) {
  if (!row.hasTable) failures.push(`${row.itemId} missing data table`);
  if (!row.hasVisualization) failures.push(`${row.itemId} missing mini graph`);
  if (row.seriesCount < 3) failures.push(`${row.itemId} mini graph has fewer than 3 series`);
  if (!row.hasEstimate || !row.hasSensitivity || !row.hasMissingness) failures.push(`${row.itemId} missing required visual encoding`);
  if (!row.hasAriaLabel) failures.push(`${row.itemId} missing visualization aria label`);
}

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: failures.length ? "data-visualization-readiness-gap" : "data-visualization-ready",
  itemCount: items.length,
  categoryCItems: categoryC.length,
  tables: rows.filter((row) => row.hasTable).length,
  miniGraphs: rows.filter((row) => row.hasVisualization).length,
  requiredEncodings: ["adjusted estimate", "uncertainty interval", "sensitivity model", "missingness"],
  accessibility: {
    visualizationsWithAriaLabels: rows.filter((row) => row.hasAriaLabel).length,
    tableFallbackRequired: true,
    status: rows.every((row) => row.hasTable && row.hasAriaLabel) ? "accessible-structure-ready" : "accessibility-gap"
  },
  matrix: rows,
  failures
};

const matrixRows = [
  ["item_id", "has_table", "has_visualization", "type", "series_count", "has_estimate", "has_sensitivity", "has_missingness", "has_aria_label", "encoding_count"],
  ...rows.map((row) => [row.itemId, row.hasTable, row.hasVisualization, row.type, row.seriesCount, row.hasEstimate, row.hasSensitivity, row.hasMissingness, row.hasAriaLabel, row.encodingCount])
];

fs.writeFileSync(path.join(outputDir, "data_visualization_readiness_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "category_c_visualization_matrix.csv"), matrixRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  categoryCItems: report.categoryCItems,
  miniGraphs: report.miniGraphs,
  failures: report.failures.length
}, null, 2));
if (failures.length) process.exitCode = 1;
