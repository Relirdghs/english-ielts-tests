const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs");

function readJson(name, fallback = null) {
  const filePath = path.join(outputDir, name);
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

const manifest = readJson("academic_test_manifest.json", {});
const content = readJson("deep_content_audit.json", {});
const source = readJson("source_url_audit.json", {});
const accessibility = readJson("accessibility_audit.json", {});
const wcag = readJson("wcag_audit_report.json", {});
const hygiene = readJson("hygiene_audit_report.json", {});
const governance = readJson("bank_governance_report.json", {});
const scoreInterpretation = readJson("score_interpretation_report.json", {});
const cefrInterpretation = readJson("cefr_interpretation_report.json", {});
const adaptive = readJson("adaptive_readiness_report.json", {});
const dataVisualization = readJson("data_visualization_readiness_report.json", {});
const examProtocol = readJson("exam_protocol_report.json", {});
const sectionRandomization = readJson("section_randomization_report.json", {});
const sessionManagement = readJson("session_management_report.json", {});
const visualSnapshot = readJson("visual_snapshot_report.json", {});
const exportIntegrity = readJson("export_integrity_report.json", {});
const operations = readJson("operations_readiness_report.json", {});
const psychometric = readJson("psychometric_calibration_report.json", {});
const bankQuality = readJson("bank_quality_review_report.json", {});
const constructCoverage = readJson("construct_coverage_report.json", {});
const distractorQuality = readJson("distractor_quality_report.json", {});
const expertAdjudication = readJson("expert_adjudication_report.json", {});
const secureDelivery = readJson("secure_delivery_readiness_report.json", {});
const pdfReport = readJson("pdf_report_pipeline_report.json", {});
const readiness = readJson("production_readiness_report.json", {});

const checks = [
  {
    gate: "content",
    status: content.failures?.length ? "fail" : "pass",
    evidence: {
      total: content.counts?.total,
      duplicatePassages: content.duplicatePassages,
      duplicateOptions: content.duplicateOptions,
      failures: content.failures?.length || 0
    }
  },
  {
    gate: "source",
    status: source.summary?.failures?.length ? "fail" : "pass",
    evidence: {
      accepted: source.summary?.accepted,
      uniqueSourceUrls: source.summary?.uniqueSourceUrls,
      failures: source.summary?.failures?.length || 0
    }
  },
  {
    gate: "accessibility",
    status: accessibility.failures?.length ? "fail" : "pass",
    evidence: {
      failures: accessibility.failures?.length || 0,
      checks: accessibility.checks?.length || 0,
      wcagStatus: wcag.status || "missing",
      skipLink: wcag.evidence?.skipLink === true,
      liveRegion: wcag.evidence?.liveRegion === true,
      humanAssistiveTechnologyAuditRequired: wcag.humanAssistiveTechnologyAuditRequired === true
    }
  },
  {
    gate: "wcag-readiness",
    status: wcag.status === "automated-readiness-pass-human-at-pending" ? "readiness-pass" : "pending-wcag-readiness",
    evidence: {
      status: wcag.status || "missing",
      skipLink: wcag.evidence?.skipLink === true,
      landmarks: wcag.evidence?.landmarks,
      progressNav: wcag.evidence?.progressNav === true,
      activeProgressCurrent: wcag.evidence?.activeProgressCurrent,
      liveRegion: wcag.evidence?.liveRegion === true,
      focusVisible: wcag.evidence?.focusVisible === true,
      manualProtocol: wcag.manualProtocol,
      limitation: "automated readiness is not formal WCAG conformance until human assistive-technology signoff is complete"
    }
  },
  {
    gate: "collapsible-analytics",
    status: accessibility.checks?.some((check) => check.name === "collapsible-analytics-aria" && check.status === "pass") ? "readiness-pass" : "fail",
    evidence: {
      ariaCheck: accessibility.checks?.find((check) => check.name === "collapsible-analytics-aria") || null,
      mobileOverflow: accessibility.mobileMetrics?.horizontalOverflow === false,
      persistedState: "acc_analytics_open",
      limitation: "collapsible analytics are validated in browser QA; human review should still assess whether default sections fit real workflows"
    }
  },
  {
    gate: "bank-blueprint",
    status: constructCoverage.coverage?.matrix?.length && distractorQuality.items?.length === 300 ? "readiness-pass" : "pending-bank-blueprint",
    evidence: {
      constructCoverageStatus: constructCoverage.status || "missing",
      constructCells: constructCoverage.coverage?.cellCount || 0,
      coveredCells: constructCoverage.coverage?.coveredCells || 0,
      reviewNeededCells: constructCoverage.coverage?.reviewNeededCells || 0,
      distractorItemCoverage: distractorQuality.items?.length || 0,
      weakDistractorItems: distractorQuality.summary?.weakDistractorItems || 0,
      optionRiskItems: distractorQuality.summary?.optionRiskItems || 0,
      taxonomySize: distractorQuality.taxonomy?.length || 0,
      limitation: "automated blueprint and distractor evidence guides review; it does not replace expert construct validation"
    }
  },
  {
    gate: "hygiene",
    status: hygiene.status === "pass" ? "pass" : "fail",
    evidence: {
      status: hygiene.status || "missing",
      scannedFiles: hygiene.scannedFiles || 0,
      findings: hygiene.findings?.length || 0,
      checks: hygiene.checks,
      allowedIdentityPolicy: hygiene.allowedIdentityPolicy,
      limitation: "binary PDFs and screenshots are excluded from text scanning; PDF content is covered by the PDF redaction gate"
    }
  },
  {
    gate: "bank-governance",
    status: governance.status === "governance-ready-human-gates-pending" ? "readiness-pass" : "fail",
    evidence: {
      status: governance.status || "missing",
      itemCount: governance.itemCount || 0,
      idsUnique: governance.idPolicy?.idsUnique === true,
      idsConform: governance.idPolicy?.idsConform === true,
      currentRange: governance.idPolicy?.currentRange,
      nextNamespace: governance.idPolicy?.nextNamespace,
      releaseDecision: governance.releaseControls?.releaseDecision,
      productionBlockers: governance.releaseControls?.productionBlockers,
      findings: governance.findings?.length || 0,
      limitation: "governance is ready for controlled beta; production release still depends on expert and pilot gates"
    }
  },
  {
    gate: "score-interpretation",
    status: scoreInterpretation.status === "provisional-score-interpretation-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: scoreInterpretation.status || "missing",
      calibrationStatus: scoreInterpretation.calibrationStatus || "missing",
      bandCount: scoreInterpretation.provisionalBands?.length || 0,
      productionReady: scoreInterpretation.productionGate?.ready === true,
      productionBlockers: scoreInterpretation.productionGate?.blockers,
      standardSettingMethod: scoreInterpretation.standardSetting?.method,
      limitation: "score bands are provisional diagnostic bands until pilot calibration and standard-setting signoff are complete"
    }
  },
  {
    gate: "cefr-interpretation",
    status: cefrInterpretation.status === "cefr-interpretation-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: cefrInterpretation.status || "missing",
      bands: cefrInterpretation.bands?.length || 0,
      calibrationStatus: cefrInterpretation.calibrationStatus || "missing",
      runtimeEvidence: cefrInterpretation.runtimeEvidence,
      productionReady: cefrInterpretation.productionReady === true,
      checks: cefrInterpretation.checks?.length || 0,
      failures: cefrInterpretation.failures?.length || 0,
      limitation: "CEFR profile explanation is runtime-ready but remains provisional until calibration and standard-setting signoff"
    }
  },
  {
    gate: "adaptive-readiness",
    status: adaptive.status === "heuristic-adaptive-ready-calibrated-cat-pending" ? "readiness-pass" : "fail",
    evidence: {
      status: adaptive.status || "missing",
      currentRuntimeMode: adaptive.modeSeparation?.currentRuntimeMode,
      productionCatMode: adaptive.modeSeparation?.productionCatMode,
      heuristicAdaptiveReady: adaptive.productionGate?.heuristicAdaptiveReady === true,
      calibratedCatReady: adaptive.productionGate?.calibratedCatReady === true,
      minimumSkillPool: adaptive.poolReadiness?.minimumSkillPool,
      minimumDifficultyPool: adaptive.poolReadiness?.minimumDifficultyPool,
      productionBlockers: adaptive.productionGate?.blockers,
      limitation: "current adaptive mode is heuristic diagnostic routing; calibrated IRT/CAT remains pending pilot data and simulations"
    }
  },
  {
    gate: "data-visualization",
    status: dataVisualization.status === "data-visualization-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: dataVisualization.status || "missing",
      categoryCItems: dataVisualization.categoryCItems || 0,
      tables: dataVisualization.tables || 0,
      miniGraphs: dataVisualization.miniGraphs || 0,
      ariaLabels: dataVisualization.accessibility?.visualizationsWithAriaLabels || 0,
      requiredEncodings: dataVisualization.requiredEncodings,
      limitation: "mini-graphs improve evidence reading; table fallback remains required for accessibility and export review"
    }
  },
  {
    gate: "exam-protocol",
    status: examProtocol.status === "exam-protocol-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: examProtocol.status || "missing",
      totalItems: examProtocol.totalItems || 0,
      sections: examProtocol.sections?.length || 0,
      totalWorkingMinutes: examProtocol.totalWorkingMinutes,
      totalBreakMinutes: examProtocol.totalBreakMinutes,
      runtimeState: examProtocol.requiredRuntimeState,
      checks: examProtocol.checks?.length || 0,
      failures: examProtocol.failures?.length || 0,
      limitation: "full-exam protocol is structured for offline delivery; production scheduling still needs hosted attempt control and invigilation rules"
    }
  },
  {
    gate: "section-randomization",
    status: sectionRandomization.status === "section-randomization-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: sectionRandomization.status || "missing",
      sections: sectionRandomization.sections?.length || 0,
      seedPolicy: sectionRandomization.seedPolicy,
      preservationRule: sectionRandomization.preservationRule,
      runtimeState: sectionRandomization.runtimeState,
      checks: sectionRandomization.checks?.length || 0,
      failures: sectionRandomization.failures?.length || 0,
      limitation: "section-preserving randomization supports offline attempts; production still needs server-issued attempt seeds"
    }
  },
  {
    gate: "session-management",
    status: sessionManagement.status === "session-management-ready" ? "readiness-pass" : "fail",
    evidence: {
      status: sessionManagement.status || "missing",
      defaultSlots: sessionManagement.defaultSlots,
      runtimeState: sessionManagement.runtimeState,
      supportedActions: sessionManagement.supportedActions,
      checks: sessionManagement.checks?.length || 0,
      failures: sessionManagement.failures?.length || 0,
      limitation: "local named slots support offline attempts; production still needs server-side attempt ownership and retention"
    }
  },
  {
    gate: "visual-snapshot",
    status: visualSnapshot.status === "visual-snapshot-pass" ? "readiness-pass" : "fail",
    evidence: {
      status: visualSnapshot.status || "missing",
      scenes: visualSnapshot.snapshots?.length || 0,
      files: (visualSnapshot.snapshots || []).map((snapshot) => snapshot.file),
      failures: visualSnapshot.failures?.length || 0,
      minimumColorBins: Math.min(...(visualSnapshot.snapshots || []).map((snapshot) => snapshot.image?.sampledColorBins || 0)),
      minimumBrightnessVariance: Math.min(...(visualSnapshot.snapshots || []).map((snapshot) => snapshot.image?.brightnessVariance || 0)),
      limitation: "snapshot QA catches visible layout regressions; it does not replace human visual review"
    }
  },
  {
    gate: "export-integrity",
    status: exportIntegrity.status === "export-integrity-pass" ? "readiness-pass" : "fail",
    evidence: {
      status: exportIntegrity.status || "missing",
      checks: exportIntegrity.checks?.length || 0,
      failures: exportIntegrity.failures?.length || 0,
      candidateReportRedacted: exportIntegrity.privacyBoundary?.candidateReportRedacted === true,
      evaluatorReportIncludesKeys: exportIntegrity.privacyBoundary?.evaluatorReportIncludesKeys === true,
      coveredSurfaces: (exportIntegrity.checks || []).map((check) => check.name),
      limitation: "runtime exports are checked for structure and leakage; production still needs signed delivery and retention controls"
    }
  },
  {
    gate: "operations-readiness",
    status: operations.status === "operations-ready-controlled-beta" ? "readiness-pass" : "fail",
    evidence: {
      status: operations.status || "missing",
      controlledBetaReady: operations.controlledBetaReady === true,
      productionReady: operations.productionReady === true,
      controlCount: operations.controls?.length || 0,
      productionBlockers: operations.productionBlockers,
      runbooks: operations.operatingModel?.minimumRunbooks,
      limitation: "operations package supports controlled beta; production hosting still needs managed infrastructure and support ownership"
    }
  },
  {
    gate: "psychometrics",
    status: psychometric.calibrationStatus === "calibrated-from-supplied-pilot-data" ? "pass-with-pilot-data" : "pending-pilot-data",
    evidence: {
      calibrationStatus: psychometric.calibrationStatus,
      candidateCount: psychometric.candidateCount,
      validResponseRows: psychometric.validResponseRows,
      recommendations: psychometric.recommendations
    }
  },
  {
    gate: "expert-review-workflow",
    status: bankQuality.itemCount !== 300
      ? "fail"
      : expertAdjudication.status === "completed-human-adjudication"
        ? "pass-with-human-adjudication"
        : "pending-human-adjudication",
    evidence: {
      itemCount: bankQuality.itemCount,
      semanticPairs: bankQuality.semanticSimilarity?.pairCount,
      antiPatternSummary: bankQuality.antiPatternSummary,
      adjudicationStatus: expertAdjudication.status || "missing",
      reviewerCount: expertAdjudication.reviewerCount || 0,
      validReviewRows: expertAdjudication.validReviewRows || 0,
      itemCoverage: expertAdjudication.itemCoverage || 0,
      doubleReviewedItemCount: expertAdjudication.doubleReviewedItemCount || 0,
      unresolvedItemCount: expertAdjudication.unresolvedItemCount || 0,
      limitation: "automated triage exists; independent expert adjudication remains pending until the adjudication report is gate-ready"
    }
  },
  {
    gate: "secure-delivery",
    status: secureDelivery.status === "prototype-pass" ? "prototype-pass" : "pending-secure-delivery",
    evidence: {
      status: secureDelivery.status || "missing",
      hiddenKeyBoundary: secureDelivery.hiddenKeyBoundary,
      candidatePayloadRedacted: secureDelivery.evidence?.candidatePayloadRedacted === true,
      candidateTokenRequired: secureDelivery.evidence?.candidateTokenRequired === true,
      adminBlockedWithoutToken: secureDelivery.evidence?.adminBlockedWithoutToken === true,
      adminTokenBoundary: secureDelivery.evidence?.adminTokenBoundary === true,
      durableStorage: secureDelivery.evidence?.durableStorage,
      auditLog: secureDelivery.evidence?.auditLog,
      candidateReportRedacted: secureDelivery.evidence?.candidateReportRedacted === true,
      evaluatorReportBoundary: secureDelivery.evidence?.evaluatorReportBoundary === true,
      serverScoring: secureDelivery.evidence?.serverScoring,
      limitation: "prototype boundary is validated; production still needs hosted auth, managed storage, TLS, rate limits, centralized logs and proctoring policy"
    }
  },
  {
    gate: "pdf-reporting",
    status: pdfReport.status === "prototype-pass" ? "prototype-pass" : "pending-pdf-reporting",
    evidence: {
      status: pdfReport.status || "missing",
      pipeline: pdfReport.pipeline,
      candidateRedacted: pdfReport.evidence?.candidateRedacted === true,
      evaluatorHasKeyAndRationale: pdfReport.evidence?.evaluatorHasKeyAndRationale === true,
      candidatePages: pdfReport.evidence?.candidatePages,
      evaluatorPages: pdfReport.evidence?.evaluatorPages,
      renderedPreviewPages: pdfReport.evidence?.renderedPreviewPages,
      outputs: pdfReport.outputs,
      limitation: "prototype renders deterministic sample PDFs; production still needs signed delivery, managed workers, retention controls and delivery logging"
    }
  },
  {
    gate: "production-readiness",
    status: readiness.readinessLevel?.includes("not yet") ? "beta" : "pass",
    evidence: {
      readinessLevel: readiness.readinessLevel,
      pending: readiness.pending
    }
  }
];

const dashboard = {
  generatedAt: new Date().toISOString(),
  bankVersion: manifest.bankVersion,
  schemaVersion: manifest.schemaVersion,
  readinessLevel: readiness.readinessLevel,
  gates: checks,
  rollup: {
    pass: checks.filter((check) => check.status === "pass" || check.status.startsWith("pass-") || check.status.endsWith("-pass")).length,
    pending: checks.filter((check) => check.status.includes("pending") || check.status === "beta").length,
    fail: checks.filter((check) => check.status === "fail").length
  },
  decision: checks.some((check) => check.status === "fail")
    ? "blocked-by-qa-failure"
    : checks.some((check) => check.status.includes("pending") || check.status === "beta")
      ? "professional-beta-not-production-calibrated"
      : "ready-for-controlled-release"
};

fs.writeFileSync(path.join(outputDir, "qa_dashboard_report.json"), JSON.stringify(dashboard, null, 2), "utf8");
console.log(JSON.stringify({
  bankVersion: dashboard.bankVersion,
  decision: dashboard.decision,
  rollup: dashboard.rollup
}, null, 2));
