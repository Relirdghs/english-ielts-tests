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
const quality = readJson("bank_quality_review_report.json", {});
const construct = readJson("construct_coverage_report.json", {});
const distractor = readJson("distractor_quality_report.json", {});
const source = readJson("source_url_audit.json", {});
const expert = readJson("expert_adjudication_report.json", {});
const psychometric = readJson("psychometric_calibration_report.json", {});
const scoreInterpretation = readJson("score_interpretation_report.json", {});
const hygiene = readJson("hygiene_audit_report.json", {});

function countBy(field) {
  const counts = {};
  for (const item of items) counts[item[field] || "missing"] = (counts[item[field] || "missing"] || 0) + 1;
  return counts;
}

function numericId(id) {
  const match = String(id).match(/^ACC_(\d{3})$/);
  return match ? Number(match[1]) : null;
}

const ids = items.map((item) => item.id);
const idNumbers = ids.map(numericId).filter((value) => value !== null);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort();
const missingNumericIds = ids.filter((id) => numericId(id) === null).sort();
const expectedIds = Array.from({ length: 300 }, (_, index) => `ACC_${String(index + 1).padStart(3, "0")}`);
const missingExpectedIds = expectedIds.filter((id) => !ids.includes(id));

const findings = [];
if (duplicateIds.length) findings.push({ severity: "P1", issue: "duplicate item IDs", itemIds: duplicateIds });
if (missingNumericIds.length) findings.push({ severity: "P1", issue: "IDs outside ACC_001 style", itemIds: missingNumericIds });
if (missingExpectedIds.length) findings.push({ severity: "P2", issue: "expected ACC_001-300 range gap", itemIds: missingExpectedIds });
if (quality.antiPatternSummary?.itemsWithWeakDistractors) findings.push({ severity: "P2", issue: "weak distractors present", count: quality.antiPatternSummary.itemsWithWeakDistractors });
if (hygiene.status && hygiene.status !== "pass") findings.push({ severity: "P1", issue: "hygiene audit not clean", status: hygiene.status });

const productionBlockers = [
  {
    gate: "expert-adjudication",
    status: expert.status === "completed-human-adjudication" ? "complete" : "pending",
    evidence: "expert_adjudication_report.json",
    requiredForProduction: true
  },
  {
    gate: "pilot-psychometrics",
    status: psychometric.calibrationStatus === "calibrated-from-supplied-pilot-data" ? "complete" : "pending",
    evidence: "psychometric_calibration_report.json",
    requiredForProduction: true
  },
  {
    gate: "standard-setting",
    status: scoreInterpretation.productionGate?.ready === true ? "complete" : "pending",
    evidence: "score_interpretation_report.json, standard_setting_protocol.md",
    requiredForProduction: true
  },
  {
    gate: "source-url-audit",
    status: !source.summary ? "pending" : source.summary.failures?.length ? "fail" : "complete",
    evidence: "source_url_audit.json",
    requiredForProduction: true
  },
  {
    gate: "bank-blueprint",
    status: construct.status === "coverage-pass" && distractor.itemCount === 300 ? "complete" : "pending",
    evidence: "construct_coverage_report.json, distractor_quality_report.json",
    requiredForProduction: true
  },
  {
    gate: "hygiene",
    status: hygiene.status === "pass" ? "complete" : "pending",
    evidence: "hygiene_audit_report.json",
    requiredForProduction: true
  }
];

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: findings.some((row) => row.severity === "P1") ? "governance-fail" : "governance-ready-human-gates-pending",
  itemCount: items.length,
  idPolicy: {
    stablePrefix: "ACC_",
    currentRange: "ACC_001-ACC_300",
    nextNamespace: "ACC_301-ACC_600",
    idsUnique: duplicateIds.length === 0,
    idsConform: missingNumericIds.length === 0,
    minNumericId: Math.min(...idNumbers),
    maxNumericId: Math.max(...idNumbers),
    idReusePolicy: "Retired IDs remain reserved and must not be reused in later banks."
  },
  lifecycle: {
    authoringPipeline: bank.authoringPipeline,
    authoringStatusCounts: countBy("authoringStatus"),
    reviewStageCounts: countBy("reviewStage"),
    retirementRuleCoverage: items.filter((item) => item.retirementRule).length,
    manualChecklistCoverage: items.filter((item) => item.manualReviewChecklist?.length).length
  },
  releaseControls: {
    productionBlockers,
    releaseDecision: productionBlockers.some((gate) => gate.status === "fail")
      ? "blocked-by-governance-failure"
      : productionBlockers.some((gate) => gate.requiredForProduction && gate.status !== "complete")
        ? "controlled-beta-only"
        : "production-release-eligible-after-final-signoff"
  },
  nextBankPlan: {
    namespace: "ACC_301-ACC_600",
    itemTarget: 300,
    categoryTargets: { A: 100, B: 100, C: 100 },
    sourceOverlapPolicy: "Use a new article-level source set; do not reuse the current 30 source horizons as the main evidence base.",
    humanGatePolicy: "Future items may start from templates but cannot enter approved status without lint, source audit, expert review and pilot evidence.",
    requiredArtifacts: [
      "draft item JSON",
      "source horizon register",
      "lint report",
      "expert review rows",
      "construct coverage update",
      "distractor quality update",
      "pilot response calibration import"
    ],
    prohibitedShortcuts: [
      "direct mass generation into approved status",
      "reusing retired item IDs",
      "copying source article prose into passages",
      "shipping production claims before expert adjudication and pilot calibration"
    ]
  },
  roleModel: [
    { role: "candidate", access: "attempt runtime and candidate-safe reports only" },
    { role: "teacher-evaluator", access: "authorized evaluator reports, notes and class-level exports" },
    { role: "expert-reviewer", access: "review templates, adjudication protocol and item evidence" },
    { role: "psychometrician", access: "pilot rows, item statistics and retirement recommendations" },
    { role: "release-manager", access: "release checklist, changelog, QA dashboard and readiness decision" }
  ],
  findings
};

const lifecyclePolicy = [
  "# Item Lifecycle Policy",
  "",
  `Bank version: ${bank.bankVersion}. Schema: ${bank.schemaVersion}.`,
  "",
  "## Stable IDs",
  "",
  "Current IDs use `ACC_001` through `ACC_300`. Future IDs start at `ACC_301`. Retired IDs remain reserved and must never be reused.",
  "",
  "## Lifecycle",
  "",
  "`draft -> linted -> expert-review -> approved -> retired` is the only supported item lifecycle. Automated lint can move an item into review readiness, but only human adjudication can approve it for production claims.",
  "",
  "## Required Evidence",
  "",
  "- Source horizon record with article-level URL.",
  "- Construct and difficulty metadata.",
  "- Distractor plausibility evidence.",
  "- Manual review checklist.",
  "- Expert adjudication rows.",
  "- Pilot psychometric rows before calibration claims.",
  "",
  "## Retirement",
  "",
  "Retire or revise items with negative discrimination, extreme facility, unresolved expert disagreement, weak distractors, source-scope ambiguity or misleading timing behaviour.",
  ""
].join("\n");

const nextBankPlan = [
  "# ACC_301-600 Authoring Plan",
  "",
  "## Scope",
  "",
  "Create a second 300-item bank with 100 Category A, 100 Category B and 100 Category C items from a new article-level source set.",
  "",
  "## Gate Sequence",
  "",
  "1. Register source horizons.",
  "2. Draft original passages.",
  "3. Run lint and source checks.",
  "4. Build construct coverage and distractor reports.",
  "5. Collect two independent expert reviews per item.",
  "6. Pilot with representative candidates.",
  "7. Calibrate, revise and retire weak items.",
  "8. Cut a release only after dashboard gates are clean.",
  "",
  "## Non-Negotiables",
  "",
  "- No direct mass generation into approved status.",
  "- No reused retired IDs.",
  "- No copied source prose.",
  "- No production-readiness label without expert and pilot evidence.",
  ""
].join("\n");

const checklistRows = [
  ["gate", "owner_role", "status", "evidence_artifact", "required_for_production"],
  ...productionBlockers.map((gate) => [
    gate.gate,
    gate.gate === "pilot-psychometrics" ? "psychometrician" : gate.gate === "expert-adjudication" ? "expert-reviewer" : gate.gate === "standard-setting" ? "assessment-lead" : "release-manager",
    gate.status,
    gate.evidence,
    gate.requiredForProduction ? "yes" : "no"
  ])
];

fs.writeFileSync(path.join(outputDir, "bank_governance_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "item_lifecycle_policy.md"), lifecyclePolicy, "utf8");
fs.writeFileSync(path.join(outputDir, "next_bank_authoring_plan.md"), nextBankPlan, "utf8");
fs.writeFileSync(path.join(outputDir, "release_signoff_checklist.csv"), checklistRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  findings: report.findings.length,
  releaseDecision: report.releaseControls.releaseDecision
}, null, 2));
if (report.status === "governance-fail") process.exitCode = 1;
