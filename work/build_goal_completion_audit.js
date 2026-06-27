#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "outputs");

function readJson(name, fallback = {}) {
  const file = path.join(OUT, name);
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readText(name) {
  const file = path.join(OUT, name);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function exists(name) {
  return fs.existsSync(path.join(OUT, name));
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function statusBy(condition, pass = "complete", fail = "partial") {
  return condition ? pass : fail;
}

const bank = readJson("item_bank.json");
const manifest = readJson("academic_test_manifest.json");
const qa = readJson("qa_dashboard_report.json");
const production = readJson("production_readiness_report.json");
const deep = readJson("deep_content_audit.json");
const expert = readJson("expert_adjudication_report.json");
const psychometric = readJson("psychometric_calibration_report.json");
const governance = readJson("bank_governance_report.json");
const adaptive = readJson("adaptive_readiness_report.json");
const exam = readJson("exam_protocol_report.json");
const session = readJson("session_management_report.json");
const randomization = readJson("section_randomization_report.json");
const source = readJson("source_verification_report.json");
const html = readText("academic_test_platform.html");

const items = bank.items || [];
const allItems = items.length === 300;
const categories = new Set(items.map((item) => item.category));
const modules = new Set(items.map((item) => item.skillModule));
const tiers = new Set(items.map((item) => item.difficultyTier));
const trapTypes = new Set(items.flatMap((item) => item.cognitiveTrapTypes || []));
const sourceDomains = new Set(items.map((item) => item.sourceDomain));

const allHave = (predicate) => items.length > 0 && items.every(predicate);
const gate = (name) => (qa.gates || []).find((row) => row.gate === name)?.status || "missing";
const deepMeta = deep.itemMetadata || {};

function row(id, planItem, status, evidence, note = "") {
  return {
    id,
    planItem,
    status,
    evidence: Array.isArray(evidence) ? evidence : [evidence],
    note
  };
}

const checks = [
  row(1, "Expert review of all 300 items", "pending-external", [
    "expert_adjudication_report.json",
    `status=${expert.status || "missing"}`,
    `reviewers=${expert.reviewerCount || 0}`
  ], "Requires independent human adjudication."),
  row(2, "Balanced modules", statusBy(modules.size >= 6 && allItems), [
    "item_bank.json",
    `modules=${modules.size}`,
    `items=${items.length}`
  ]),
  row(3, "Difficulty tiers", statusBy(tiers.size >= 3 && allItems), [
    "item_bank.json",
    `tiers=${tiers.size}`
  ]),
  row(4, "Complete item metadata", statusBy(allHave((item) =>
    item.id && item.category && item.skillModule && item.difficultyTier &&
    item.sourceDomain && item.sourceVerification && item.reviewStage &&
    item.psychometrics && item.manualReviewChecklist && item.retirementRule
  )), ["item_bank.json", "metadata fields present"]),
  row(5, "Distractor taxonomy", statusBy(trapTypes.size >= 4 && allHave((item) => (item.cognitiveTrapTypes || []).length >= 4)), [
    "item_bank.json",
    `trapTypes=${trapTypes.size}`
  ]),
  row(6, "item_bank source of truth", statusBy(exists("item_bank.json") && manifest.files?.includes("item_bank.json")), [
    "item_bank.json",
    "academic_test_manifest.json"
  ]),
  row(7, "Authoring pipeline", statusBy(Boolean(bank.authoringPipeline) && governance.status), [
    "item_bank.json",
    "bank_governance_report.json",
    `status=${governance.status || "missing"}`
  ], "Human gates remain explicit."),
  row(8, "Bank linting", statusBy(exists("bank_quality_review_report.json") && exists("hygiene_audit_report.json")), [
    "bank_quality_review_report.json",
    "hygiene_audit_report.json",
    `hygiene=${deepMeta.hygieneStatus || "missing"}`
  ]),
  row(9, "Source report", statusBy(source.itemCoverage === 300 && exists("source_url_audit.json")), [
    "source_verification_report.json",
    "source_url_audit.json",
    `coverage=${source.itemCoverage || 0}`
  ]),
  row(10, "Category C visuals", statusBy((deepMeta.withDataDisplays || 0) === 100 && exists("data_visualization_readiness_report.json")), [
    "data_visualization_readiness_report.json",
    `withDataDisplays=${deepMeta.withDataDisplays || 0}`
  ]),
  row(11, "SPA data tables", statusBy(html.includes("data-display") || html.includes("mini-graph") || html.includes("Category C")), [
    "academic_test_platform.html",
    "category_c_visualization_matrix.csv"
  ]),
  row(12, "Full exam protocol", statusBy(exam.status === "exam-protocol-ready"), [
    "exam_protocol_report.json",
    `status=${exam.status || "missing"}`
  ]),
  row(13, "Short and domain modes", "partial", [
    "academic_test_platform.html",
    `domains=${sourceDomains.size}`,
    "category and domain filters exist"
  ], "Domain drill presets are filters, not named drill attempts."),
  row(14, "Adaptive mode", "readiness-pass", [
    "adaptive_readiness_report.json",
    `status=${adaptive.status || "missing"}`
  ], "Calibrated IRT/CAT waits for pilot data."),
  row(15, "Scoring model", statusBy(Boolean(bank.scoringModel) && exists("score_interpretation_report.json")), [
    "item_bank.json",
    "score_interpretation_report.json"
  ]),
  row(16, "CEFR explanation", "readiness-pass", [
    "cefr_interpretation_report.json",
    `gate=${gate("cefr-interpretation")}`
  ], "Bands are provisional before standard-setting."),
  row(17, "Per-skill analytics", statusBy(html.includes("bySkill") && html.includes("Skill Performance")), [
    "academic_test_platform.html"
  ]),
  row(18, "Review filters", statusBy(html.includes("reviewFilter") && html.includes("Wrong or partial") && html.includes("Flagged only")), [
    "academic_test_platform.html"
  ]),
  row(19, "Answer history", statusBy(html.includes("answerHistory") && html.includes("answerHistoryCount")), [
    "academic_test_platform.html"
  ]),
  row(20, "JSON CSV PDF exports", statusBy(gate("export-integrity") === "readiness-pass" && gate("pdf-reporting") === "prototype-pass"), [
    "export_integrity_report.json",
    "pdf_report_pipeline_report.json"
  ]),
  row(21, "Candidate evaluator reports", statusBy(html.includes("exportCandidateReportHtml") && html.includes("exportEvaluatorReportHtml")), [
    "academic_test_platform.html",
    "pdf_report_pipeline_report.json"
  ]),
  row(22, "Named session slots", statusBy(session.status === "session-management-ready"), [
    "session_management_report.json",
    `status=${session.status || "missing"}`
  ]),
  row(23, "Resets", statusBy(html.includes("resetCurrentSession") && html.includes("resetAllSessions")), [
    "academic_test_platform.html"
  ]),
  row(24, "Progress map", statusBy(html.includes("progress-map") && html.includes("map-dot")), [
    "academic_test_platform.html"
  ]),
  row(25, "Search", statusBy(html.includes("Search items") && html.includes("setSearch")), [
    "academic_test_platform.html"
  ]),
  row(26, "Keyboard shortcuts", statusBy(html.includes("Keyboard shortcuts") && html.includes("toggleShortcuts")), [
    "academic_test_platform.html"
  ]),
  row(27, "Mobile UX", statusBy(gate("visual-snapshot") === "readiness-pass" && exists("qa_mobile_initial.png")), [
    "visual_snapshot_report.json",
    "qa_mobile_initial.png"
  ]),
  row(28, "Reading settings", statusBy(html.includes("readingSettings") || html.includes("lineHeight") || html.includes("fontSize")), [
    "academic_test_platform.html"
  ]),
  row(29, "Accessibility", "partial", [
    "accessibility_audit.json",
    "wcag_audit_report.json",
    "wcag_assistive_tech_protocol.md",
    `gate=${gate("wcag-readiness")}`
  ], "Formal assistive-technology signoff remains external."),
  row(30, "Light dark system theme", html.includes("prefers-color-scheme") ? "complete" : "partial", [
    "academic_test_platform.html",
    "theme toggle implemented"
  ], "System preference auto-detection is not present."),
  row(31, "Exam integrity", statusBy(html.includes("integrity") && exists("proctoring_integrity_policy.md")), [
    "academic_test_platform.html",
    "proctoring_integrity_policy.md"
  ]),
  row(32, "Learning mode", statusBy(html.includes("learning") && html.includes("Review Rationale")), [
    "academic_test_platform.html"
  ]),
  row(33, "Blind review", statusBy(html.includes("blind") && html.includes("showReviewAll")), [
    "academic_test_platform.html"
  ]),
  row(34, "Confidence marking", statusBy(html.includes("setConfidence") && html.includes("low") && html.includes("high")), [
    "academic_test_platform.html"
  ]),
  row(35, "Confidence analytics", statusBy(html.includes("confidenceBuckets") && html.includes("Confidence Calibration")), [
    "academic_test_platform.html"
  ]),
  row(36, "Admin debug", statusBy(html.includes("admin") && html.includes("expertAdjudication") && html.includes("pilotResponses")), [
    "academic_test_platform.html"
  ]),
  row(37, "QA dashboard", statusBy(qa.rollup?.fail === 0 && exists("qa_dashboard_report.json")), [
    "qa_dashboard_report.json",
    `pass=${qa.rollup?.pass ?? "missing"}`,
    `pending=${qa.rollup?.pending ?? "missing"}`
  ]),
  row(38, "Uniqueness", statusBy(allHave((item) => Number(item.uniquenessScore) >= 0.85)), [
    "item_bank.json",
    "bank_quality_review_report.json"
  ]),
  row(39, "Semantic audit", statusBy(exists("construct_coverage_report.json") && exists("deep_content_audit.json") && (deep.failures || []).length === 0), [
    "construct_coverage_report.json",
    "deep_content_audit.json"
  ]),
  row(40, "Banned phrases", statusBy(exists("banned_phrase_registry.json") && exists("hygiene_audit_report.json")), [
    "banned_phrase_registry.json",
    "hygiene_audit_report.json"
  ]),
  row(41, "Templates with gates", statusBy(exists("authoring_templates.md") && exists("manual_review_packet.md")), [
    "authoring_templates.md",
    "manual_review_packet.md"
  ]),
  row(42, "Regression tests", statusBy(exists("academic_test_quality_audit.json") && exists("qa_dashboard_report.json")), [
    "academic_test_quality_audit.json",
    "qa_dashboard_report.json"
  ]),
  row(43, "Snapshot QA", statusBy(gate("visual-snapshot") === "readiness-pass"), [
    "visual_snapshot_report.json",
    "visual_snapshot_matrix.csv"
  ]),
  row(44, "Content tests", statusBy((deep.failures || []).length === 0 && exists("deep_content_audit.json")), [
    "deep_content_audit.json"
  ]),
  row(45, "Source tests", statusBy(gate("source") === "pass" && exists("source_url_audit.json")), [
    "source_url_audit.json",
    "source_verification_report.json"
  ]),
  row(46, "No secrets emails", statusBy(gate("hygiene") === "pass"), [
    "hygiene_audit_report.json",
    `gate=${gate("hygiene")}`
  ]),
  row(47, "Versioning", statusBy(Boolean(bank.bankVersion) && Boolean(bank.schemaVersion)), [
    "item_bank.json",
    `bankVersion=${bank.bankVersion || "missing"}`,
    `schemaVersion=${bank.schemaVersion || "missing"}`
  ]),
  row(48, "Changelog", statusBy(exists("CHANGELOG.md") && readText("CHANGELOG.md").includes(bank.bankVersion)), [
    "CHANGELOG.md"
  ]),
  row(49, "Docs", statusBy(exists("assessment_platform_docs.md") && exists("manual_review_packet.md")), [
    "assessment_platform_docs.md",
    "manual_review_packet.md"
  ]),
  row(50, "Roadmap", statusBy(exists("next_bank_authoring_plan.md") && exists("next_improvement_plan.md")), [
    "next_bank_authoring_plan.md",
    "next_improvement_plan.md"
  ]),
  row(51, "Known limitations", statusBy((bank.limitations || []).length > 0 && (production.pending || []).length > 0), [
    "item_bank.json",
    "production_readiness_report.json"
  ]),
  row(52, "Licensing note", statusBy(Boolean(source.copyrightPolicy)), [
    "source_verification_report.json",
    source.copyrightPolicy || "missing"
  ]),
  row(53, "Deploy prep Vite React", "partial", [
    "production_deployment_runbook.md",
    "app.webmanifest",
    "sw.js"
  ], "Standalone deployment is prepared; React/Vite app split is not implemented."),
  row(54, "PWA", statusBy(exists("app.webmanifest") && exists("sw.js")), [
    "app.webmanifest",
    "sw.js"
  ]),
  row(55, "Bank import export", statusBy(html.includes("importBankFile") && html.includes("exportItemBankJson")), [
    "academic_test_platform.html"
  ]),
  row(56, "New banks without HTML edits", statusBy(html.includes("importBankFile") && manifest.files?.includes("item_bank.json")), [
    "academic_test_platform.html",
    "academic_test_manifest.json"
  ]),
  row(57, "Teacher evaluator mode", "readiness-pass", [
    "secure_delivery_readiness_report.json",
    "academic_test_platform.html",
    `gate=${gate("secure-delivery")}`
  ], "Production hosted auth remains pending."),
  row(58, "Candidate mode", statusBy(html.includes("candidate") && html.includes("Candidate")), [
    "academic_test_platform.html"
  ]),
  row(59, "Random options mapping", statusBy(html.includes("randomOptions") && html.includes("optionOrder")), [
    "academic_test_platform.html",
    "export_integrity_report.json"
  ]),
  row(60, "Section random order", statusBy(randomization.status === "section-randomization-ready"), [
    "section_randomization_report.json",
    `status=${randomization.status || "missing"}`
  ]),
  row(61, "Anti-pattern audit", statusBy(exists("banned_phrase_registry.json") && exists("bank_quality_review_report.json")), [
    "banned_phrase_registry.json",
    "bank_quality_review_report.json"
  ]),
  row(62, "Distractor plausibility", statusBy((deepMeta.withPlausibilityRatings || 0) === 300 && (deepMeta.weakDistractorItems || 0) === 0), [
    "distractor_quality_report.json",
    `ratings=${deepMeta.withPlausibilityRatings || 0}`,
    `weak=${deepMeta.weakDistractorItems || 0}`
  ]),
  row(63, "Manual checklist", statusBy((deepMeta.withReviewChecklists || 0) === 300), [
    "manual_review_packet.md",
    `items=${deepMeta.withReviewChecklists || 0}`
  ]),
  row(64, "Psychometrics after pilot", "pending-external", [
    "psychometric_calibration_report.json",
    `status=${psychometric.calibrationStatus || "missing"}`,
    `candidates=${psychometric.candidateCount || 0}`
  ], "Requires real pilot-response data."),
  row(65, "Retirement rules", statusBy(allHave((item) => item.retirementRule) && exists("item_lifecycle_policy.md")), [
    "item_bank.json",
    "item_lifecycle_policy.md"
  ]),
  row(66, "Production readiness", "partial", [
    "production_readiness_report.json",
    `level=${production.readinessLevel || "missing"}`
  ], "Readiness report says beta, not calibrated production."),
  row(67, "Final full audit", "partial", [
    "qa_dashboard_report.json",
    "deep_content_audit.json",
    "goal_completion_audit.json"
  ], "Automated audit is complete; external gates remain.")
];

const rollup = checks.reduce((acc, check) => {
  acc[check.status] = (acc[check.status] || 0) + 1;
  return acc;
}, {});

const externalBlockers = [
  "independent expert adjudication",
  "pilot psychometric data",
  "formal standard-setting signoff",
  "assistive-technology signoff",
  "production auth, storage and hosting",
  "production proctoring controls"
];

const audit = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion || qa.bankVersion || null,
  schemaVersion: bank.schemaVersion || qa.schemaVersion || null,
  decision: "controlled-beta-ready-not-production-complete",
  qaRollup: qa.rollup || null,
  goalRollup: rollup,
  externalBlockers,
  checks
};

const jsonPath = path.join(OUT, "goal_completion_audit.json");
fs.writeFileSync(jsonPath, JSON.stringify(audit, null, 2) + "\n");

const csvRows = [
  ["id", "plan_item", "status", "evidence", "note"],
  ...checks.map((check) => [
    check.id,
    check.planItem,
    check.status,
    check.evidence.join("; "),
    check.note
  ])
];
fs.writeFileSync(
  path.join(OUT, "goal_completion_matrix.csv"),
  csvRows.map((cells) => cells.map(csvCell).join(",")).join("\n") + "\n"
);

console.log(JSON.stringify({
  decision: audit.decision,
  bankVersion: audit.bankVersion,
  schemaVersion: audit.schemaVersion,
  goalRollup: audit.goalRollup,
  blockers: audit.externalBlockers
}, null, 2));
