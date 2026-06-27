const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");
const itemBankPath = path.join(outputDir, "item_bank.json");
const itemBank = fs.existsSync(itemBankPath) ? JSON.parse(fs.readFileSync(itemBankPath, "utf8")) : null;
const sourceVerificationPath = path.join(outputDir, "source_verification_report.json");
const sourceVerification = fs.existsSync(sourceVerificationPath) ? JSON.parse(fs.readFileSync(sourceVerificationPath, "utf8")) : null;
const psychometricPath = path.join(outputDir, "psychometric_calibration_report.json");
const psychometric = fs.existsSync(psychometricPath) ? JSON.parse(fs.readFileSync(psychometricPath, "utf8")) : null;
const scoreInterpretationPath = path.join(outputDir, "score_interpretation_report.json");
const scoreInterpretation = fs.existsSync(scoreInterpretationPath) ? JSON.parse(fs.readFileSync(scoreInterpretationPath, "utf8")) : null;
const cefrInterpretationPath = path.join(outputDir, "cefr_interpretation_report.json");
const cefrInterpretation = fs.existsSync(cefrInterpretationPath) ? JSON.parse(fs.readFileSync(cefrInterpretationPath, "utf8")) : null;
const adaptivePath = path.join(outputDir, "adaptive_readiness_report.json");
const adaptive = fs.existsSync(adaptivePath) ? JSON.parse(fs.readFileSync(adaptivePath, "utf8")) : null;
const dataVisualizationPath = path.join(outputDir, "data_visualization_readiness_report.json");
const dataVisualization = fs.existsSync(dataVisualizationPath) ? JSON.parse(fs.readFileSync(dataVisualizationPath, "utf8")) : null;
const examProtocolPath = path.join(outputDir, "exam_protocol_report.json");
const examProtocol = fs.existsSync(examProtocolPath) ? JSON.parse(fs.readFileSync(examProtocolPath, "utf8")) : null;
const sectionRandomizationPath = path.join(outputDir, "section_randomization_report.json");
const sectionRandomization = fs.existsSync(sectionRandomizationPath) ? JSON.parse(fs.readFileSync(sectionRandomizationPath, "utf8")) : null;
const sessionManagementPath = path.join(outputDir, "session_management_report.json");
const sessionManagement = fs.existsSync(sessionManagementPath) ? JSON.parse(fs.readFileSync(sessionManagementPath, "utf8")) : null;
const visualSnapshotPath = path.join(outputDir, "visual_snapshot_report.json");
const visualSnapshot = fs.existsSync(visualSnapshotPath) ? JSON.parse(fs.readFileSync(visualSnapshotPath, "utf8")) : null;
const exportIntegrityPath = path.join(outputDir, "export_integrity_report.json");
const exportIntegrity = fs.existsSync(exportIntegrityPath) ? JSON.parse(fs.readFileSync(exportIntegrityPath, "utf8")) : null;
const qaDashboardPath = path.join(outputDir, "qa_dashboard_report.json");
const qaDashboard = fs.existsSync(qaDashboardPath) ? JSON.parse(fs.readFileSync(qaDashboardPath, "utf8")) : null;
const hygienePath = path.join(outputDir, "hygiene_audit_report.json");
const hygiene = fs.existsSync(hygienePath) ? JSON.parse(fs.readFileSync(hygienePath, "utf8")) : null;
const governancePath = path.join(outputDir, "bank_governance_report.json");
const governance = fs.existsSync(governancePath) ? JSON.parse(fs.readFileSync(governancePath, "utf8")) : null;
const operationsPath = path.join(outputDir, "operations_readiness_report.json");
const operations = fs.existsSync(operationsPath) ? JSON.parse(fs.readFileSync(operationsPath, "utf8")) : null;
const bankQualityPath = path.join(outputDir, "bank_quality_review_report.json");
const bankQuality = fs.existsSync(bankQualityPath) ? JSON.parse(fs.readFileSync(bankQualityPath, "utf8")) : null;
const constructCoveragePath = path.join(outputDir, "construct_coverage_report.json");
const constructCoverage = fs.existsSync(constructCoveragePath) ? JSON.parse(fs.readFileSync(constructCoveragePath, "utf8")) : null;
const distractorQualityPath = path.join(outputDir, "distractor_quality_report.json");
const distractorQuality = fs.existsSync(distractorQualityPath) ? JSON.parse(fs.readFileSync(distractorQualityPath, "utf8")) : null;
const expertAdjudicationPath = path.join(outputDir, "expert_adjudication_report.json");
const expertAdjudication = fs.existsSync(expertAdjudicationPath) ? JSON.parse(fs.readFileSync(expertAdjudicationPath, "utf8")) : null;
const secureDeliveryPath = path.join(outputDir, "secure_delivery_readiness_report.json");
const secureDelivery = fs.existsSync(secureDeliveryPath) ? JSON.parse(fs.readFileSync(secureDeliveryPath, "utf8")) : null;
const pdfReportPath = path.join(outputDir, "pdf_report_pipeline_report.json");
const pdfReport = fs.existsSync(pdfReportPath) ? JSON.parse(fs.readFileSync(pdfReportPath, "utf8")) : null;
const wcagReportPath = path.join(outputDir, "wcag_audit_report.json");
const wcagReport = fs.existsSync(wcagReportPath) ? JSON.parse(fs.readFileSync(wcagReportPath, "utf8")) : null;
const wcagMatrixPath = path.join(outputDir, "wcag_conformance_matrix.json");
const wcagMatrix = fs.existsSync(wcagMatrixPath) ? JSON.parse(fs.readFileSync(wcagMatrixPath, "utf8")) : null;
const html = fs.readFileSync(path.join(outputDir, "academic_test_platform.html"), "utf8");
const match = html.match(/const EMBEDDED_TESTS = (.*?);\n    const DEFAULT_BANK_INFO/s);
if (!match) throw new Error("Cannot locate TESTS payload in HTML.");
const tests = JSON.parse(match[1]);
const letters = ["A", "B", "C", "D", "E"];

function wc(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function yearFromSource(source) {
  const match = source.match(/,\s*(20\d{2})\s*-/);
  return match ? Number(match[1]) : null;
}

const counts = {
  total: tests.length,
  A: tests.filter((t) => t.category === "A").length,
  B: tests.filter((t) => t.category === "B").length,
  C: tests.filter((t) => t.category === "C").length
};

const answerDistribution = Object.fromEntries(letters.map((letter) => [letter, 0]));
for (const test of tests) {
  for (const answer of test.correct) answerDistribution[answer] += 1;
}

const repeatedOpenings20 = tests.length - new Set(tests.map((test) => test.passage.split(/\s+/).slice(0, 20).join(" "))).size;
const repeatedOpenings10 = tests.length - new Set(tests.map((test) => test.passage.split(/\s+/).slice(0, 10).join(" "))).size;
const duplicatePassages = tests.length - new Set(tests.map((test) => test.passage)).size;
const duplicateOptions = tests.length - new Set(tests.map((test) => test.options.join(" || "))).size;
const allText = tests.map((test) => [test.passage, test.prompt, ...test.options, test.rationale].join("\n")).join("\n");

const failures = [];
if (!itemBank) failures.push("item_bank.json missing");
if (itemBank) {
  if (itemBank.schemaVersion !== "2.25.0") failures.push(`Unexpected item bank schema ${itemBank.schemaVersion}`);
  if (!Array.isArray(itemBank.items) || itemBank.items.length !== 300) failures.push("item_bank.json does not contain 300 items");
  if (!itemBank.scoringModel || !itemBank.authoringPipeline) failures.push("item bank missing scoringModel or authoringPipeline");
  if (!itemBank.scoringModel?.secureDelivery) failures.push("item bank missing secure delivery scoring model note");
  if (!itemBank.limitations?.length) failures.push("item bank missing limitations");
}
for (const requiredFile of ["source_verification_report.json", "production_readiness_report.json", "assessment_platform_docs.md", "CHANGELOG.md", "app.webmanifest", "sw.js", "accessibility_audit.json", "wcag_audit_report.json", "wcag_conformance_matrix.json", "wcag_assistive_tech_protocol.md", "accessibility_statement.md", "psychometric_calibration_report.json", "psychometric_item_summary.csv", "pilot_response_template.csv", "score_interpretation_report.json", "standard_setting_protocol.md", "score_claim_register.md", "cut_score_policy.csv", "cefr_interpretation_report.json", "cefr_interpretation_matrix.csv", "adaptive_readiness_report.json", "adaptive_algorithm_spec.md", "item_exposure_policy.md", "adaptive_simulation_matrix.csv", "data_visualization_readiness_report.json", "category_c_visualization_matrix.csv", "exam_protocol_report.json", "exam_protocol_matrix.csv", "section_randomization_report.json", "section_randomization_matrix.csv", "session_management_report.json", "session_management_matrix.csv", "visual_snapshot_report.json", "visual_snapshot_matrix.csv", "export_integrity_report.json", "export_integrity_matrix.csv", "snapshot_desktop_learning.png", "snapshot_category_c_visual.png", "snapshot_admin_review.png", "snapshot_mobile_initial.png", "qa_dashboard_report.json", "hygiene_audit_report.json", "bank_governance_report.json", "item_lifecycle_policy.md", "next_bank_authoring_plan.md", "release_signoff_checklist.csv", "operations_readiness_report.json", "production_deployment_runbook.md", "data_retention_policy.md", "proctoring_integrity_policy.md", "incident_response_runbook.md", "bank_quality_review_report.json", "construct_coverage_report.json", "distractor_quality_report.json", "blueprint_matrix.csv", "manual_review_packet.md", "review_queue.csv", "expert_review_template.csv", "expert_review_protocol.md", "expert_adjudication_report.json", "secure_delivery_api_spec.json", "secure_delivery_blueprint.md", "secure_delivery_readiness_report.json", "pdf_report_pipeline_report.json", "pdf/academic-assessment-candidate-report.pdf", "pdf/academic-assessment-evaluator-report.pdf", "pdf/academic-assessment-candidate-report-preview.png", "pdf/academic-assessment-evaluator-report-preview.png", "banned_phrase_registry.json", "authoring_templates.md"]) {
  if (!fs.existsSync(path.join(outputDir, requiredFile))) failures.push(`${requiredFile} missing`);
}
if (!bankQuality) failures.push("bank_quality_review_report.json missing");
else {
  if (bankQuality.itemCount !== 300 || !Array.isArray(bankQuality.items) || bankQuality.items.length !== 300) failures.push("bank quality review report does not cover 300 items");
  if (!Array.isArray(bankQuality.bannedPhraseRegistry) || !bankQuality.bannedPhraseRegistry.length) failures.push("banned phrase registry missing from bank quality report");
  if (!bankQuality.semanticSimilarity || typeof bankQuality.semanticSimilarity.pairCount !== "number") failures.push("semantic similarity audit missing from bank quality report");
  if (!bankQuality.constructCoverage || typeof bankQuality.constructCoverage.cellCount !== "number") failures.push("construct coverage missing from bank quality report");
  if (typeof bankQuality.antiPatternSummary?.itemsWithWeakDistractors !== "number") failures.push("weak distractor summary missing from bank quality report");
}
if (!hygiene) failures.push("hygiene_audit_report.json missing");
else {
  if (hygiene.status !== "pass") failures.push(`hygiene audit status ${hygiene.status || "missing"}`);
  if (hygiene.findings?.length) failures.push(`hygiene audit has ${hygiene.findings.length} findings`);
  if (hygiene.checks?.noTokenLiterals !== true || hygiene.checks?.noUnexpectedEmails !== true) failures.push("hygiene token/email checks are not clean");
  if (hygiene.checks?.noRemoteScriptDependencies !== true) failures.push("hygiene remote script check is not clean");
}
if (!governance) failures.push("bank_governance_report.json missing");
else {
  if (governance.bankVersion !== itemBank?.bankVersion) failures.push("governance bank version does not match item bank");
  if (governance.status !== "governance-ready-human-gates-pending") failures.push(`governance status ${governance.status || "missing"}`);
  if (governance.idPolicy?.idsUnique !== true || governance.idPolicy?.idsConform !== true) failures.push("governance ID policy evidence is not clean");
  if (governance.idPolicy?.nextNamespace !== "ACC_301-ACC_600") failures.push("governance next namespace missing");
  if (!Array.isArray(governance.roleModel) || governance.roleModel.length < 5) failures.push("governance role model is incomplete");
  if (governance.releaseControls?.releaseDecision !== "controlled-beta-only") failures.push("governance release decision is unexpected");
}
if (!scoreInterpretation) failures.push("score_interpretation_report.json missing");
else {
  if (scoreInterpretation.bankVersion !== itemBank?.bankVersion) failures.push("score interpretation bank version does not match item bank");
  if (scoreInterpretation.status !== "provisional-score-interpretation-ready") failures.push(`score interpretation status ${scoreInterpretation.status || "missing"}`);
  if (!Array.isArray(scoreInterpretation.provisionalBands) || scoreInterpretation.provisionalBands.length !== 4) failures.push("score interpretation bands incomplete");
  if (!Array.isArray(scoreInterpretation.interpretationBoundaries) || scoreInterpretation.interpretationBoundaries.length < 4) failures.push("score interpretation boundaries incomplete");
  if (scoreInterpretation.productionGate?.ready !== false) failures.push("score interpretation production gate should remain false before calibration");
}
if (!cefrInterpretation) failures.push("cefr_interpretation_report.json missing");
else {
  if (cefrInterpretation.bankVersion !== itemBank?.bankVersion) failures.push("CEFR interpretation bank version does not match item bank");
  if (cefrInterpretation.status !== "cefr-interpretation-ready") failures.push(`CEFR interpretation status ${cefrInterpretation.status || "missing"}`);
  if (!Array.isArray(cefrInterpretation.bands) || cefrInterpretation.bands.length !== 4) failures.push("CEFR interpretation bands incomplete");
  if (!Array.isArray(cefrInterpretation.runtimeEvidence) || cefrInterpretation.runtimeEvidence.length < 4) failures.push("CEFR runtime evidence incomplete");
  if ((cefrInterpretation.failures?.length || 0) !== 0) failures.push("CEFR interpretation report has failures");
}
if (!adaptive) failures.push("adaptive_readiness_report.json missing");
else {
  if (adaptive.bankVersion !== itemBank?.bankVersion) failures.push("adaptive bank version does not match item bank");
  if (adaptive.status !== "heuristic-adaptive-ready-calibrated-cat-pending") failures.push(`adaptive status ${adaptive.status || "missing"}`);
  if (adaptive.productionGate?.heuristicAdaptiveReady !== true || adaptive.productionGate?.calibratedCatReady !== false) failures.push("adaptive readiness flags are unexpected");
  if (!Array.isArray(adaptive.calibratedCatRequirements) || adaptive.calibratedCatRequirements.length < 5) failures.push("adaptive CAT requirements incomplete");
  if ((adaptive.poolReadiness?.minimumSkillPool || 0) < 30) failures.push("adaptive minimum skill pool too small");
}
if (!dataVisualization) failures.push("data_visualization_readiness_report.json missing");
else {
  if (dataVisualization.bankVersion !== itemBank?.bankVersion) failures.push("data visualization bank version does not match item bank");
  if (dataVisualization.status !== "data-visualization-ready") failures.push(`data visualization status ${dataVisualization.status || "missing"}`);
  if (dataVisualization.categoryCItems !== 100 || dataVisualization.miniGraphs !== 100 || dataVisualization.tables !== 100) failures.push("Category C visualization coverage incomplete");
  if (dataVisualization.accessibility?.visualizationsWithAriaLabels !== 100) failures.push("Category C visualization aria-label coverage incomplete");
}
if (!examProtocol) failures.push("exam_protocol_report.json missing");
else {
  if (examProtocol.bankVersion !== itemBank?.bankVersion) failures.push("exam protocol bank version does not match item bank");
  if (examProtocol.status !== "exam-protocol-ready") failures.push(`exam protocol status ${examProtocol.status || "missing"}`);
  if (examProtocol.totalItems !== 300 || examProtocol.sections?.length !== 3) failures.push("exam protocol section coverage incomplete");
  if (examProtocol.totalWorkingMinutes !== 270 || examProtocol.totalBreakMinutes !== 20) failures.push("exam protocol timing is unexpected");
  if ((examProtocol.failures?.length || 0) !== 0) failures.push("exam protocol report has failures");
}
if (!sectionRandomization) failures.push("section_randomization_report.json missing");
else {
  if (sectionRandomization.bankVersion !== itemBank?.bankVersion) failures.push("section randomization bank version does not match item bank");
  if (sectionRandomization.status !== "section-randomization-ready") failures.push(`section randomization status ${sectionRandomization.status || "missing"}`);
  if (!Array.isArray(sectionRandomization.sections) || sectionRandomization.sections.length !== 3) failures.push("section randomization sections incomplete");
  if (!sectionRandomization.sections?.every((section) => section.itemCount === 100 && section.orderChanged === true)) failures.push("section randomization coverage incomplete");
  if ((sectionRandomization.failures?.length || 0) !== 0) failures.push("section randomization report has failures");
}
if (!sessionManagement) failures.push("session_management_report.json missing");
else {
  if (sessionManagement.bankVersion !== itemBank?.bankVersion) failures.push("session management bank version does not match item bank");
  if (sessionManagement.status !== "session-management-ready") failures.push(`session management status ${sessionManagement.status || "missing"}`);
  if (!Array.isArray(sessionManagement.defaultSlots) || sessionManagement.defaultSlots.length < 3) failures.push("session management default slots incomplete");
  if (!Array.isArray(sessionManagement.supportedActions) || sessionManagement.supportedActions.length < 5) failures.push("session management actions incomplete");
  if ((sessionManagement.failures?.length || 0) !== 0) failures.push("session management report has failures");
}
if (!visualSnapshot) failures.push("visual_snapshot_report.json missing");
else {
  if (visualSnapshot.bankVersion !== itemBank?.bankVersion) failures.push("visual snapshot bank version does not match item bank");
  if (visualSnapshot.status !== "visual-snapshot-pass") failures.push(`visual snapshot status ${visualSnapshot.status || "missing"}`);
  if (!Array.isArray(visualSnapshot.snapshots) || visualSnapshot.snapshots.length !== 4) failures.push("visual snapshot scene coverage incomplete");
  if ((visualSnapshot.failures?.length || 0) !== 0) failures.push("visual snapshot report has failures");
  for (const snapshot of visualSnapshot.snapshots || []) {
    if (snapshot.status !== "pass") failures.push(`visual snapshot ${snapshot.scene || "unknown"} did not pass`);
    if ((snapshot.image?.sampledColorBins || 0) < 18 || (snapshot.image?.brightnessVariance || 0) < 80) failures.push(`visual snapshot ${snapshot.scene || "unknown"} appears blank`);
    if (snapshot.metrics?.horizontalOverflow === true) failures.push(`visual snapshot ${snapshot.scene || "unknown"} has horizontal overflow`);
  }
}
if (!exportIntegrity) failures.push("export_integrity_report.json missing");
else {
  if (exportIntegrity.bankVersion !== itemBank?.bankVersion) failures.push("export integrity bank version does not match item bank");
  if (exportIntegrity.status !== "export-integrity-pass") failures.push(`export integrity status ${exportIntegrity.status || "missing"}`);
  if (!Array.isArray(exportIntegrity.checks) || exportIntegrity.checks.length < 5) failures.push("export integrity checks incomplete");
  if ((exportIntegrity.failures?.length || 0) !== 0) failures.push("export integrity report has failures");
  if (exportIntegrity.privacyBoundary?.candidateReportRedacted !== true || exportIntegrity.privacyBoundary?.evaluatorReportIncludesKeys !== true) failures.push("export privacy boundary evidence incomplete");
}
if (!operations) failures.push("operations_readiness_report.json missing");
else {
  if (operations.bankVersion !== itemBank?.bankVersion) failures.push("operations bank version does not match item bank");
  if (operations.status !== "operations-ready-controlled-beta") failures.push(`operations status ${operations.status || "missing"}`);
  if (operations.controlledBetaReady !== true || operations.productionReady !== false) failures.push("operations readiness flags are unexpected");
  if (!Array.isArray(operations.controls) || operations.controls.length < 8) failures.push("operations controls are incomplete");
  if (!Array.isArray(operations.productionBlockers) || operations.productionBlockers.length < 5) failures.push("operations production blockers incomplete");
}
if (!constructCoverage) failures.push("construct_coverage_report.json missing");
else {
  if (constructCoverage.bankVersion !== itemBank?.bankVersion) failures.push("construct coverage bank version does not match item bank");
  if (!Array.isArray(constructCoverage.constructMap) || constructCoverage.constructMap.length < 3) failures.push("construct map coverage is too thin");
  if (!constructCoverage.coverage || !Array.isArray(constructCoverage.coverage.matrix) || constructCoverage.coverage.matrix.length < 12) failures.push("construct coverage matrix is incomplete");
}
if (!distractorQuality) failures.push("distractor_quality_report.json missing");
else {
  if (distractorQuality.bankVersion !== itemBank?.bankVersion) failures.push("distractor quality bank version does not match item bank");
  if (distractorQuality.itemCount !== 300 || !Array.isArray(distractorQuality.items) || distractorQuality.items.length !== 300) failures.push("distractor quality report does not cover 300 items");
  if (!Array.isArray(distractorQuality.taxonomy) || distractorQuality.taxonomy.length < 6) failures.push("distractor taxonomy coverage is incomplete");
  if (typeof distractorQuality.summary?.weakDistractorItems !== "number") failures.push("distractor quality summary missing weak distractor count");
}
if (!expertAdjudication) failures.push("expert_adjudication_report.json missing");
else {
  if (expertAdjudication.itemCount !== 300 || !Array.isArray(expertAdjudication.items) || expertAdjudication.items.length !== 300) failures.push("expert adjudication report does not cover 300 items");
  if (!expertAdjudication.status) failures.push("expert adjudication status missing");
  if (!expertAdjudication.completionGate || typeof expertAdjudication.completionGate.gateReady !== "boolean") failures.push("expert adjudication completion gate missing");
}
if (!secureDelivery) failures.push("secure_delivery_readiness_report.json missing");
else {
  if (secureDelivery.status !== "prototype-pass") failures.push(`secure delivery prototype status ${secureDelivery.status || "missing"}`);
  if (secureDelivery.evidence?.health?.itemCount !== 300) failures.push("secure delivery health evidence does not cover 300 items");
  if (secureDelivery.evidence?.candidatePayloadRedacted !== true) failures.push("secure delivery candidate redaction evidence missing");
  if (secureDelivery.evidence?.candidateTokenRequired !== true) failures.push("secure delivery candidate authorization evidence missing");
  if (secureDelivery.evidence?.adminBlockedWithoutToken !== true) failures.push("secure delivery unauthenticated admin block missing");
  if (secureDelivery.evidence?.adminTokenBoundary !== true) failures.push("secure delivery runtime admin authorization evidence missing");
  if (secureDelivery.evidence?.serverScoring?.score !== 1) failures.push("secure delivery server scoring evidence missing");
  if (secureDelivery.evidence?.durableStorage?.candidateSummaryRedacted !== true) failures.push("secure delivery durable storage evidence missing");
  if (secureDelivery.evidence?.durableStorage?.candidateTokenStoredHashOnly !== true) failures.push("secure delivery hash-only candidate token evidence missing");
  if (secureDelivery.evidence?.auditLog?.requiredActionsPresent !== true) failures.push("secure delivery audit log evidence missing");
  if (secureDelivery.evidence?.candidateReportRedacted !== true) failures.push("secure delivery candidate report redaction evidence missing");
  if (secureDelivery.evidence?.evaluatorReportBoundary !== true) failures.push("secure delivery evaluator report authorization evidence missing");
}
if (!pdfReport) failures.push("pdf_report_pipeline_report.json missing");
else {
  if (pdfReport.status !== "prototype-pass") failures.push(`pdf report pipeline status ${pdfReport.status || "missing"}`);
  if (pdfReport.bankVersion !== itemBank?.bankVersion) failures.push("pdf report bank version does not match item bank");
  if (pdfReport.evidence?.candidateRedacted !== true) failures.push("pdf candidate redaction evidence missing");
  if (pdfReport.evidence?.evaluatorHasKeyAndRationale !== true) failures.push("pdf evaluator key/rationale evidence missing");
  if (pdfReport.evidence?.candidatePages < 1 || pdfReport.evidence?.evaluatorPages < 1) failures.push("pdf page count evidence missing");
  if (pdfReport.evidence?.renderedPreviewPages !== 2) failures.push("pdf preview rendering evidence missing");
  for (const outputPath of Object.values(pdfReport.outputs || {})) {
    if (outputPath && !fs.existsSync(path.join(outputDir, outputPath))) failures.push(`pdf output missing: ${outputPath}`);
  }
}
if (!/function importBankFile/.test(html) || !/function exportItemBankJson/.test(html)) failures.push("runtime bank import/export functions missing from HTML");
if (!/serviceWorker/.test(html) || !/app\.webmanifest/.test(html)) failures.push("PWA hooks missing from HTML");
if (!/class="skip-link"/.test(html) || !/id="status-live"/.test(html) || !/role="banner"/.test(html) || !/aria-label="Progress map"/.test(html)) failures.push("WCAG runtime landmarks, skip link or live status region missing from HTML");
if (!/function importPilotResponses/.test(html) || !/function exportPilotTemplate/.test(html)) failures.push("pilot psychometric import/template functions missing from HTML");
if (!/function importExpertReviews/.test(html) || !/function exportExpertTemplate/.test(html) || !/Expert Adjudication/.test(html)) failures.push("expert adjudication runtime functions missing from HTML");
if (!/answerHistory/.test(html) || !/timeSpent/.test(html) || !/function recordTimeForCurrentItem/.test(html)) failures.push("session answer-history or per-item timing protocol missing from HTML");
if (!/confidenceAdjustedPercent/.test(html) || !/function confidenceAdjustedScore/.test(html)) failures.push("confidence-adjusted scoring missing from HTML");
if (!/function exportCandidateReportHtml/.test(html) || !/function exportEvaluatorReportHtml/.test(html)) failures.push("candidate/evaluator report exports missing from HTML");
if (!/function cefrProfileExplanation/.test(html) || !/CEFR rationale/.test(html) || !/profileExplanation/.test(html)) failures.push("CEFR runtime explanation missing from HTML");
if (!/function toggleAnalyticsSection/.test(html) || !/data-analytics-section/.test(html) || !/acc_analytics_open/.test(html)) failures.push("collapsible analytics runtime missing from HTML");
if (!/function examProtocolSnapshot/.test(html) || !/function toggleExamBreak/.test(html) || !/acc_exam_breaks/.test(html) || !/Exam Protocol/.test(html)) failures.push("exam protocol runtime missing from HTML");
if (!/function orderedSectionIndices/.test(html) || !/function questionOrderSnapshot/.test(html) || !/shuffles items inside sections/.test(html)) failures.push("section-preserving randomization runtime missing from HTML");
if (!/function saveNamedSlot/.test(html) || !/acc_slot_labels/.test(html) || !/Session name/.test(html)) failures.push("named session slot runtime missing from HTML");
if (!/function renderDataVisualization/.test(html) || !/data-viz/.test(html)) failures.push("Category C mini-graph renderer missing from HTML");
if (!psychometric) failures.push("psychometric_calibration_report.json missing");
else {
  if (psychometric.itemCount !== 300 || !Array.isArray(psychometric.items) || psychometric.items.length !== 300) failures.push("psychometric calibration report does not cover 300 items");
  if (!psychometric.calibrationStatus) failures.push("psychometric calibration status missing");
}
if (!qaDashboard) failures.push("qa_dashboard_report.json missing");
else if (qaDashboard.rollup?.fail) {
  const failingGates = Array.isArray(qaDashboard.gates) ? qaDashboard.gates.filter((gate) => gate.status === "fail").map((gate) => gate.gate) : [];
  if (!(failingGates.length === 1 && failingGates[0] === "content")) failures.push(`qa dashboard has ${qaDashboard.rollup.fail} failing gates`);
} else if (itemBank && qaDashboard.bankVersion !== itemBank.bankVersion) failures.push("qa dashboard bank version does not match item bank");
if (!wcagReport) failures.push("wcag_audit_report.json missing");
else {
  if (wcagReport.status !== "automated-readiness-pass-human-at-pending") failures.push(`wcag audit status ${wcagReport.status || "missing"}`);
  if (wcagReport.evidence?.skipLink !== true) failures.push("wcag skip link evidence missing");
  if (wcagReport.evidence?.landmarks?.main !== true || wcagReport.evidence?.landmarks?.banner !== true) failures.push("wcag landmark evidence missing");
  if (wcagReport.evidence?.liveRegion !== true) failures.push("wcag live region evidence missing");
}
if (!wcagMatrix) failures.push("wcag_conformance_matrix.json missing");
else {
  if (wcagMatrix.status !== "automated-readiness-pass-human-at-pending") failures.push(`wcag matrix status ${wcagMatrix.status || "missing"}`);
  if (!Array.isArray(wcagMatrix.criteria) || wcagMatrix.criteria.length < 8) failures.push("wcag matrix does not cover enough criteria");
}
if (sourceVerification) {
  if (sourceVerification.sourceCount !== 30 || sourceVerification.itemCoverage !== 300) failures.push("source verification coverage is incomplete");
  if (sourceVerification.sources.filter((source) => source.acceptedByUrlAudit).length !== 30) failures.push("source verification report does not contain 30 accepted URL audit results");
} else {
  failures.push("source_verification_report.json missing");
}
if (counts.total !== 300 || counts.A !== 100 || counts.B !== 100 || counts.C !== 100) failures.push(`Bad distribution ${JSON.stringify(counts)}`);
if (duplicatePassages) failures.push(`${duplicatePassages} duplicate passages`);
if (duplicateOptions) failures.push(`${duplicateOptions} duplicate option sets`);
if (repeatedOpenings20) failures.push(`${repeatedOpenings20} repeated 20-word openings`);
if (repeatedOpenings10 > 15) failures.push(`${repeatedOpenings10} repeated 10-word openings`);

const badPatterns = [
  /\bundefined\b/i,
  /\bNaN\b/,
  /\[object Object\]/,
  /\bis remained\b/i,
  /as if it represented/i,
  /claims will replicate claims/i,
  /Attrition is/i,
  /attrition bias/i,
  /The implication is that a /,
  /Source Horizon: \[Источник/i
];
for (const pattern of badPatterns) {
  if (pattern.test(allText)) failures.push(`Bad pattern found: ${pattern}`);
}

for (const test of tests) {
  const words = wc(test.passage);
  if (words < 150 || words > 250) failures.push(`${test.id} word count ${words}`);
  if (!/^[A-Z0-9]/.test(test.passage.trim())) failures.push(`${test.id} passage does not start uppercase/alphanumeric`);
  if (test.options.length !== 5 || new Set(test.options).size !== 5) failures.push(`${test.id} options invalid`);
  if (test.category === "B" && ![2, 3].includes(test.correct.length)) failures.push(`${test.id} B correct count invalid`);
  if (test.category !== "B" && test.correct.length !== 1) failures.push(`${test.id} single correct count invalid`);
  if (test.expectedSelections !== test.correct.length) failures.push(`${test.id} expectedSelections mismatch`);
  if (!test.skillModule || !test.difficultyTier || !test.cognitiveTrapTypes?.length) failures.push(`${test.id} missing assessment metadata`);
  if (!test.estimatedTimeSeconds || !test.scoringWeight) failures.push(`${test.id} missing time/weight metadata`);
  if (!test.authoringStatus || !test.reviewStage || !test.psychometrics?.calibrationStatus) failures.push(`${test.id} missing authoring/psychometric metadata`);
  if (!test.sourceVerification?.articleLevel) failures.push(`${test.id} missing article-level source verification metadata`);
  if (typeof test.uniquenessScore !== "number" || test.uniquenessScore < 0.8) failures.push(`${test.id} weak or missing uniqueness score`);
  if (!test.semanticSignature || !test.retirementRule) failures.push(`${test.id} missing semantic signature or retirement rule`);
  if (!test.distractorPlausibilityRating?.length || !test.manualReviewChecklist?.length) failures.push(`${test.id} missing plausibility/review checklist metadata`);
  if (!test.correct.every((answer) => letters.includes(answer))) failures.push(`${test.id} invalid correct answer`);
  if (!test.sourceUrl.includes("nature.com/articles/") && !test.sourceUrl.includes("science.org/doi/")) failures.push(`${test.id} non-article URL`);
  const year = yearFromSource(test.sourceHorizon);
  if (!year || year < 2022 || year > 2026) failures.push(`${test.id} source year outside 2022-2026`);
  if (!/false-synchrony|false synchrony/i.test(test.rationale)) failures.push(`${test.id} rationale missing false-synchrony trap`);
  if (!/modal/i.test(test.rationale)) failures.push(`${test.id} rationale missing modal trap`);
  if (test.category === "B") {
    const hasCaveatDeletionDistractor = test.options.some((option) => /^Delete the limitation/.test(option));
    if (hasCaveatDeletionDistractor && !/overgeneral/i.test(test.rationale)) failures.push(`${test.id} rationale missing overgeneralisation trap`);
  } else {
    if (!/overgeneral/i.test(test.rationale)) failures.push(`${test.id} rationale missing overgeneralisation trap`);
    if (!/out-of-context/i.test(test.rationale)) failures.push(`${test.id} rationale missing out-of-context trap`);
  }
  if (test.category === "C" && (!test.dataDisplay?.rows || test.dataDisplay.rows.length < 5)) failures.push(`${test.id} missing Category C data display`);
  if (test.category === "C" && (!test.dataVisualization?.series || test.dataVisualization.series.length < 3 || !test.dataVisualization.ariaLabel)) failures.push(`${test.id} missing Category C data visualization`);
}

const summary = {
  checkedAt: new Date().toISOString(),
  counts,
  wordCount: {
    min: Math.min(...tests.map((test) => wc(test.passage))),
    max: Math.max(...tests.map((test) => wc(test.passage)))
  },
  answerDistribution,
  duplicatePassages,
  duplicateOptions,
  repeatedOpenings10,
  repeatedOpenings20,
  sourceUrls: {
    unique: new Set(tests.map((test) => test.sourceUrl)).size,
    articleLevelItems: tests.filter((test) => test.sourceUrl.includes("nature.com/articles/") || test.sourceUrl.includes("science.org/doi/")).length
  },
  itemMetadata: {
    withDataDisplays: tests.filter((test) => test.dataDisplay).length,
    withSourceVerification: tests.filter((test) => test.sourceVerification?.articleLevel).length,
    withReviewChecklists: tests.filter((test) => test.manualReviewChecklist?.length).length,
    withPlausibilityRatings: tests.filter((test) => test.distractorPlausibilityRating?.length).length,
    constructCoverageCells: constructCoverage?.coverage?.cellCount || 0,
    distractorQualityItems: distractorQuality?.items?.length || 0,
    weakDistractorItems: distractorQuality?.summary?.weakDistractorItems || 0,
    hygieneStatus: hygiene?.status || "missing",
    hygieneFindings: hygiene?.findings?.length || 0,
    governanceStatus: governance?.status || "missing",
    governanceFindings: governance?.findings?.length || 0,
    scoreInterpretationStatus: scoreInterpretation?.status || "missing",
    provisionalScoreBands: scoreInterpretation?.provisionalBands?.length || 0,
    cefrInterpretationStatus: cefrInterpretation?.status || "missing",
    cefrInterpretationBands: cefrInterpretation?.bands?.length || 0,
    adaptiveStatus: adaptive?.status || "missing",
    adaptiveMinimumSkillPool: adaptive?.poolReadiness?.minimumSkillPool || 0,
    dataVisualizationStatus: dataVisualization?.status || "missing",
    categoryCMiniGraphs: dataVisualization?.miniGraphs || 0,
    examProtocolStatus: examProtocol?.status || "missing",
    examProtocolSections: examProtocol?.sections?.length || 0,
    sectionRandomizationStatus: sectionRandomization?.status || "missing",
    sectionRandomizationSections: sectionRandomization?.sections?.length || 0,
    sessionManagementStatus: sessionManagement?.status || "missing",
    sessionManagementActions: sessionManagement?.supportedActions?.length || 0,
    visualSnapshotStatus: visualSnapshot?.status || "missing",
    visualSnapshotScenes: visualSnapshot?.snapshots?.length || 0,
    exportIntegrityStatus: exportIntegrity?.status || "missing",
    exportIntegrityChecks: exportIntegrity?.checks?.length || 0,
    operationsStatus: operations?.status || "missing",
    operationsControls: operations?.controls?.length || 0
  },
  failures
};

fs.writeFileSync(path.join(outputDir, "deep_content_audit.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;




