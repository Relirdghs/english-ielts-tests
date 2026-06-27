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
const psychometric = readJson("psychometric_calibration_report.json", {});
const quality = readJson("bank_quality_review_report.json", {});
const governance = readJson("bank_governance_report.json", {});
const items = bank.items || [];

function countBy(fields) {
  const map = new Map();
  for (const item of items) {
    const key = fields.map((field) => item[field] || "missing").join("||");
    const entry = map.get(key) || Object.fromEntries(fields.map((field) => [field, item[field] || "missing"]));
    entry.itemCount = (entry.itemCount || 0) + 1;
    entry.items = entry.items || [];
    entry.items.push(item.id);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => fields.map((field) => String(a[field]).localeCompare(String(b[field]))).find(Boolean) || 0);
}

const skillPools = countBy(["skillModule"]);
const difficultyPools = countBy(["difficultyTier"]);
const categorySkillPools = countBy(["category", "skillModule"]);
const categoryDifficultyPools = countBy(["category", "difficultyTier"]);
const sourceDomainPools = countBy(["sourceDomain"]);

const minimumSkillPool = Math.min(...skillPools.map((pool) => pool.itemCount));
const minimumDifficultyPool = Math.min(...difficultyPools.map((pool) => pool.itemCount));
const exposureLimitPerAdaptiveDrill = 0.2;
const heuristicReady = items.length === 300
  && minimumSkillPool >= 30
  && minimumDifficultyPool >= 70
  && quality.antiPatternSummary?.itemsWithWeakDistractors === 0
  && governance.releaseControls?.releaseDecision === "controlled-beta-only";
const calibratedReady = psychometric.calibrationStatus === "calibrated-from-supplied-pilot-data";

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: heuristicReady ? "heuristic-adaptive-ready-calibrated-cat-pending" : "adaptive-readiness-gap",
  itemCount: items.length,
  modeSeparation: {
    currentRuntimeMode: "heuristic adaptive drill",
    productionCatMode: "pending calibrated IRT/CAT",
    candidateFacingLabel: "Adaptive drill",
    forbiddenLabelBeforeCalibration: "calibrated adaptive exam"
  },
  poolReadiness: {
    skillPools,
    difficultyPools,
    categorySkillPools,
    categoryDifficultyPools,
    sourceDomainPools,
    minimumSkillPool,
    minimumDifficultyPool,
    weakDistractorItems: quality.antiPatternSummary?.itemsWithWeakDistractors || 0
  },
  selectionPolicy: {
    firstItems: "balanced by category and difficulty, not purely random",
    afterResponses: "prioritize the weakest submitted skill while preserving category and difficulty spread",
    exposureLimitPerAdaptiveDrill,
    randomization: "seeded item and option ordering must preserve answer-key mapping",
    stopRules: ["diagnostic length reached", "candidate exits drill", "future calibrated standard error threshold"]
  },
  calibratedCatRequirements: [
    "pilot response rows with representative candidates",
    "stable item parameters with uncertainty estimates",
    "item exposure controls",
    "content balancing constraints",
    "simulation evidence for bias and pool depletion",
    "accessibility and accommodation review for adaptive navigation",
    "expert approval that adaptive routing does not distort construct coverage"
  ],
  productionGate: {
    heuristicAdaptiveReady: heuristicReady,
    calibratedCatReady: calibratedReady,
    blockers: [
      calibratedReady ? null : "IRT/CAT calibration missing",
      psychometric.candidateCount ? null : "representative pilot candidate sample missing",
      "adaptive pool simulation with calibrated item parameters missing",
      "human review of adaptive construct coverage missing"
    ].filter(Boolean)
  }
};

const algorithmSpec = [
  "# Adaptive Algorithm Specification",
  "",
  `Bank version: ${bank.bankVersion}. Schema: ${bank.schemaVersion}.`,
  "",
  "## Current Mode",
  "",
  "The runtime adaptive mode is a heuristic diagnostic drill. It uses submitted performance to prioritize weaker skill modules while preserving the existing item bank constraints.",
  "",
  "## Candidate Label",
  "",
  "Use `Adaptive drill`. Do not label it as `calibrated adaptive exam` until IRT/CAT calibration and simulations are complete.",
  "",
  "## Selection Rules",
  "",
  "- Start from a balanced category and difficulty spread.",
  "- Prefer the weakest submitted skill after enough responses exist.",
  "- Keep option randomization mapped to source answer keys.",
  "- Avoid overexposing any narrow source-domain pool.",
  "- Preserve review and rationale rules for learning, integrity and blind-review modes.",
  "",
  "## CAT Upgrade",
  "",
  "A production CAT upgrade requires calibrated item parameters, standard error stop rules, exposure controls, fairness checks and expert signoff.",
  ""
].join("\n");

const exposurePolicy = [
  "# Item Exposure Policy",
  "",
  "## Controlled Beta",
  "",
  `No adaptive drill should expose more than ${Math.round(exposureLimitPerAdaptiveDrill * 100)}% of the bank unless explicitly configured as a full mock or full exam.`,
  "",
  "## Rotation",
  "",
  "Rotate items by category, skill module, difficulty tier and source domain. Preserve stable IDs and do not reuse retired items.",
  "",
  "## Production Requirement",
  "",
  "Production adaptive delivery requires exposure-rate monitoring, pool depletion alerts and periodic item retirement review.",
  ""
].join("\n");

const simulationRows = [
  ["dimension", "value", "item_count", "minimum_required", "status"],
  ...skillPools.map((pool) => ["skill", pool.skillModule, pool.itemCount, 30, pool.itemCount >= 30 ? "pass" : "review"]),
  ...difficultyPools.map((pool) => ["difficulty", pool.difficultyTier, pool.itemCount, 70, pool.itemCount >= 70 ? "pass" : "review"]),
  ...categorySkillPools.map((pool) => ["category_skill", `${pool.category}:${pool.skillModule}`, pool.itemCount, 30, pool.itemCount >= 30 ? "pass" : "review"])
];

fs.writeFileSync(path.join(outputDir, "adaptive_readiness_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "adaptive_algorithm_spec.md"), algorithmSpec, "utf8");
fs.writeFileSync(path.join(outputDir, "item_exposure_policy.md"), exposurePolicy, "utf8");
fs.writeFileSync(path.join(outputDir, "adaptive_simulation_matrix.csv"), simulationRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  heuristicAdaptiveReady: report.productionGate.heuristicAdaptiveReady,
  calibratedCatReady: report.productionGate.calibratedCatReady
}, null, 2));
if (report.status === "adaptive-readiness-gap") process.exitCode = 1;
