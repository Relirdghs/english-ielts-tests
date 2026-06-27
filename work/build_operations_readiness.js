const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");

function readJson(name, fallback = null) {
  const filePath = path.join(outputDir, name);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

const bank = readJson("item_bank.json", { items: [] });
const secureDelivery = readJson("secure_delivery_readiness_report.json", {});
const pdfReport = readJson("pdf_report_pipeline_report.json", {});
const hygiene = readJson("hygiene_audit_report.json", {});
const wcag = readJson("wcag_audit_report.json", {});
const governance = readJson("bank_governance_report.json", {});
const score = readJson("score_interpretation_report.json", {});

const controls = [
  {
    domain: "authentication",
    controlledBeta: secureDelivery.evidence?.candidateTokenRequired === true && secureDelivery.evidence?.adminTokenBoundary === true,
    productionRequirement: "Hosted identity, role mapping, session expiry, MFA for administrators and auditable evaluator access."
  },
  {
    domain: "storage",
    controlledBeta: secureDelivery.evidence?.durableStorage?.candidateTokenStoredHashOnly === true,
    productionRequirement: "Managed database, encrypted backups, retention jobs, restore drills and deletion workflow."
  },
  {
    domain: "report-delivery",
    controlledBeta: pdfReport.evidence?.candidateRedacted === true && pdfReport.evidence?.evaluatorHasKeyAndRationale === true,
    productionRequirement: "Signed report URLs, access logs, report expiry and managed rendering workers."
  },
  {
    domain: "audit-logging",
    controlledBeta: secureDelivery.evidence?.auditLog?.requiredActionsPresent === true,
    productionRequirement: "Centralized immutable logs, alerting, log retention and incident correlation."
  },
  {
    domain: "accessibility-operations",
    controlledBeta: wcag.status === "automated-readiness-pass-human-at-pending",
    productionRequirement: "Human assistive-technology audit signoff and regression plan for every release."
  },
  {
    domain: "release-governance",
    controlledBeta: governance.status === "governance-ready-human-gates-pending",
    productionRequirement: "Named release owner, signoff checklist, rollback criteria and change freeze rules."
  },
  {
    domain: "score-claims",
    controlledBeta: score.status === "provisional-score-interpretation-ready",
    productionRequirement: "Completed standard setting, pilot calibration and public score-claim boundaries."
  },
  {
    domain: "hygiene",
    controlledBeta: hygiene.status === "pass",
    productionRequirement: "CI-enforced no-secret, no-unexpected-email and no-remote-script checks."
  }
];

const missingControlledBeta = controls.filter((control) => !control.controlledBeta);
const productionBlockers = [
  "hosted authentication and authorization",
  "managed durable storage with backups and retention",
  "centralized logs and monitoring",
  "signed report delivery",
  "formal WCAG assistive-technology signoff",
  "expert adjudication",
  "pilot psychometric calibration",
  "standard-setting signoff",
  "production proctoring policy and appeal workflow"
];

const report = {
  generatedAt: new Date().toISOString(),
  bankVersion: bank.bankVersion,
  schemaVersion: bank.schemaVersion,
  status: missingControlledBeta.length ? "operations-gap" : "operations-ready-controlled-beta",
  itemCount: bank.items?.length || 0,
  controlledBetaReady: missingControlledBeta.length === 0,
  productionReady: false,
  controls,
  productionBlockers,
  operatingModel: {
    environments: ["local-offline", "controlled-beta-server", "production-hosted"],
    requiredRoles: ["release-manager", "assessment-lead", "teacher-evaluator", "support-operator", "security-owner"],
    minimumRunbooks: [
      "production_deployment_runbook.md",
      "data_retention_policy.md",
      "proctoring_integrity_policy.md",
      "incident_response_runbook.md"
    ]
  },
  limitations: [
    "The current operations package supports controlled beta planning, not production hosting.",
    "Production still requires managed infrastructure, live monitoring, legal review and support ownership."
  ]
};

const deploymentRunbook = [
  "# Production Deployment Runbook",
  "",
  `Bank version: ${bank.bankVersion}. Schema: ${bank.schemaVersion}.`,
  "",
  "## Release Steps",
  "",
  "1. Freeze bank JSON and generated artifacts.",
  "2. Run content, source, accessibility, hygiene, governance, score and secure-delivery QA.",
  "3. Verify no local secure-delivery data remains in the worktree.",
  "4. Deploy server-backed delivery behind hosted authentication.",
  "5. Configure managed database, backups, logs and report retention.",
  "6. Run smoke tests for candidate, evaluator and admin roles.",
  "7. Record release owner, version, rollback target and known limitations.",
  "",
  "## Rollback",
  "",
  "Rollback if candidate redaction fails, admin auth fails, report access leaks evaluator-only content, storage writes fail or QA dashboard records a failed gate.",
  ""
].join("\n");

const retentionPolicy = [
  "# Data Retention Policy",
  "",
  "## Controlled Beta",
  "",
  "- Store candidate attempt IDs, response rows, timing, confidence and score summaries only for the agreed pilot window.",
  "- Store candidate access tokens as hashes only.",
  "- Delete local prototype storage after QA runs.",
  "- Keep evaluator report access separate from candidate report access.",
  "",
  "## Production Requirement",
  "",
  "A production deployment needs explicit retention periods, deletion requests, backup expiry, audit-log retention and institutional data-processing approval.",
  ""
].join("\n");

const proctoringPolicy = [
  "# Proctoring and Integrity Policy",
  "",
  "## Current Mode",
  "",
  "The current package supports diagnostic and controlled-beta delivery. It does not provide certified proctoring.",
  "",
  "## Integrity Controls",
  "",
  "- Candidate payloads are redacted in the secure-delivery prototype.",
  "- Candidate endpoints require per-attempt bearer tokens.",
  "- Evaluator reports require admin authorization.",
  "- Timing, confidence and answer history support review of anomalous attempts.",
  "",
  "## Production Requirement",
  "",
  "High-stakes deployment needs identity checks, proctoring consent, appeal workflow, accommodation policy, anomaly review and retest rules.",
  ""
].join("\n");

const incidentRunbook = [
  "# Incident Response Runbook",
  "",
  "## Trigger Conditions",
  "",
  "- Candidate report exposes answer keys or rationales.",
  "- Admin token boundary fails.",
  "- Attempt storage loses submitted responses.",
  "- PDF delivery exposes evaluator-only material.",
  "- Source or score claim is found misleading.",
  "",
  "## Response",
  "",
  "1. Pause delivery.",
  "2. Preserve logs.",
  "3. Identify affected attempts.",
  "4. Rotate runtime secrets.",
  "5. Revoke exposed reports.",
  "6. Publish corrected limitation or score notice.",
  "7. Re-run all QA gates before reopening.",
  ""
].join("\n");

fs.writeFileSync(path.join(outputDir, "operations_readiness_report.json"), JSON.stringify(report, null, 2), "utf8");
fs.writeFileSync(path.join(outputDir, "production_deployment_runbook.md"), deploymentRunbook, "utf8");
fs.writeFileSync(path.join(outputDir, "data_retention_policy.md"), retentionPolicy, "utf8");
fs.writeFileSync(path.join(outputDir, "proctoring_integrity_policy.md"), proctoringPolicy, "utf8");
fs.writeFileSync(path.join(outputDir, "incident_response_runbook.md"), incidentRunbook, "utf8");

console.log(JSON.stringify({
  bankVersion: report.bankVersion,
  status: report.status,
  controlledBetaReady: report.controlledBetaReady,
  productionReady: report.productionReady
}, null, 2));
if (report.status === "operations-gap") process.exitCode = 1;
