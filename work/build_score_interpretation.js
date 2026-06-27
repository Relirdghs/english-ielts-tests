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
const governance = readJson("bank_governance_report.json", {});
const items = bank.items || [];
const totalWeight = items.reduce((sum, item) => sum + (Number(item.scoringWeight) || 1), 0);
const standardSettingSignoff = false;

const bands = [
  {
    profile: "C1 Developing",
    minWeightedPercent: 0,
    maxWeightedPercent: 0.599,
    reportableClaim: "Candidate shows partial control of academic reading and usage tasks but should receive targeted review before high-stakes C1 claims.",
    recommendedAction: "Use skill analytics and review mode before retesting."
  },
  {
    profile: "C1 Secure",
    minWeightedPercent: 0.6,
    maxWeightedPercent: 0.759,
    reportableClaim: "Candidate appears secure on many C1 academic tasks in this bank, subject to item review and pilot calibration limits.",
    recommendedAction: "Check weakest modules and confidence calibration."
  },
  {
    profile: "C2 Emerging",
    minWeightedPercent: 0.76,
    maxWeightedPercent: 0.879,
    reportableClaim: "Candidate shows emerging C2-level performance across complex academic tasks, but production claims require calibrated cut scores.",
    recommendedAction: "Confirm performance across methodology and data interpretation items."
  },
  {
    profile: "C2 Secure",
    minWeightedPercent: 0.88,
    maxWeightedPercent: 1,
    reportableClaim: "Candidate performs strongly on the current high-level academic assessment bank; do not treat this as certified C2 without external validation.",
    recommendedAction: "Use evaluator review for high-stakes decisions."
  }
];

const boundaries = [
  "Score bands are provisional and must not be marketed as official CEFR certification.",
  "Production cut scores require expert standard setting and representative pilot calibration.",
  "Low item coverage, unusual timing, random-click patterns or unresolved accessibility barriers should downgrade confidence in interpretation.",
  "Skill-level analytics are diagnostic signals, not standalone certification claims.",
  "Confidence-adjusted scores support metacognitive feedback; they are not replacement cut scores."
];

const standardSetting = {
  requiredPanelRoles: ["assessment lead", "C1/C2 academic English expert", "methodologist", "psychometrician", "accessibility reviewer"],
  minimumPanelSize: 5,
  method: "Modified Angoff plus bookmark review after pilot response data",
  requiredRounds: [
    "construct briefing",
    "item-level expected-candidate judgments",
    "impact-data review from pilot responses",
    "cut-score reconciliation",
    "documentation and signoff"
  ],
  requiredEvidence: [
    "expert item judgments",
    "pilot facility and discrimination",
    "standard error or reliability evidence",
    "differential performance review when sample allows",
    "published limitations for candidate and evaluator reports"
  ]
};

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: "provisional-score-interpretation-ready",
  calibrationStatus: psychometric.calibrationStatus || "missing",
  governanceDecision: governance.releaseControls?.releaseDecision || "missing",
  scoringBasis: {
    itemCount: items.length,
    totalWeight: Number(totalWeight.toFixed(2)),
    rawScore: "sum of item scores divided by submitted/possible items",
    weightedScore: "sum of item score multiplied by scoringWeight divided by possible weight",
    partialCredit: bank.scoringModel?.multipleSelect || "missing",
    confidenceAdjustedScore: bank.scoringModel?.confidenceAnalytics || "missing"
  },
  provisionalBands: bands,
  interpretationBoundaries: boundaries,
  standardSetting,
  reportRules: {
    candidateReport: "Show profile, raw, weighted and confidence-adjusted scores; omit answer keys and rationales.",
    evaluatorReport: "Show answer keys, rationales, timing, confidence, item metadata and evaluator notes.",
    minimumDiagnosticCoverage: "Do not make profile claims from very short drills; use short modes for diagnostics only.",
    highStakesUse: "Requires completed expert adjudication, pilot calibration, standard-setting signoff and secure delivery."
  },
  productionGate: {
    ready: psychometric.calibrationStatus === "calibrated-from-supplied-pilot-data" && governance.releaseControls?.releaseDecision === "production-release-eligible-after-final-signoff" && standardSettingSignoff,
    blockers: [
      psychometric.calibrationStatus === "calibrated-from-supplied-pilot-data" ? null : "pilot calibration missing",
      governance.releaseControls?.releaseDecision === "production-release-eligible-after-final-signoff" ? null : "governance release is not production-eligible",
      standardSettingSignoff ? null : "standard-setting panel signoff missing"
    ].filter(Boolean)
  }
};

const protocol = [
  "# Standard Setting Protocol",
  "",
  `Bank version: ${bank.bankVersion}. Schema: ${bank.schemaVersion}.`,
  "",
  "## Purpose",
  "",
  "Define defensible score interpretation before any high-stakes CEFR-style claim is made.",
  "",
  "## Panel",
  "",
  standardSetting.requiredPanelRoles.map((role) => `- ${role}`).join("\n"),
  "",
  "## Rounds",
  "",
  standardSetting.requiredRounds.map((round, index) => `${index + 1}. ${round}.`).join("\n"),
  "",
  "## Required Evidence",
  "",
  standardSetting.requiredEvidence.map((entry) => `- ${entry}.`).join("\n"),
  "",
  "## Release Rule",
  "",
  "Current bands are provisional. Production score interpretation requires completed expert adjudication, pilot calibration, standard-setting signoff and secure delivery controls.",
  ""
].join("\n");

const claimRegister = [
  "# Score Claim Register",
  "",
  "## Allowed Now",
  "",
  "- Diagnostic profile based on the current bank.",
  "- Skill-level feedback for learning and evaluator review.",
  "- Provisional weighted and confidence-adjusted score reporting.",
  "",
  "## Not Allowed Yet",
  "",
  "- Official CEFR certification.",
  "- Institution-wide normed placement.",
  "- Production high-stakes pass/fail decision.",
  "- Claim that the current cut scores are psychometrically calibrated.",
  ""
].join("\n");

const rows = [
  ["profile", "min_weighted_percent", "max_weighted_percent", "claim", "recommended_action"],
  ...bands.map((band) => [band.profile, band.minWeightedPercent, band.maxWeightedPercent, band.reportableClaim, band.recommendedAction])
];

fs.writeFileSync(path.join(outputDir, "score_interpretation_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "standard_setting_protocol.md"), protocol, "utf8");
fs.writeFileSync(path.join(outputDir, "score_claim_register.md"), claimRegister, "utf8");
fs.writeFileSync(path.join(outputDir, "cut_score_policy.csv"), rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n", "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  productionReady: report.productionGate.ready,
  blockers: report.productionGate.blockers.length
}, null, 2));
