const CACHE_NAME = "academic-c1c2-assessment-candidate-ui-v1";
const ASSETS = [
  "./academic_test_platform.html",
  "./item_bank.json",
  "./advanced_academic_tests.md",
  "./academic_test_manifest.json",
  "./source_verification_report.json",
  "./production_readiness_report.json",
  "./wcag_audit_report.json",
  "./wcag_conformance_matrix.json",
  "./wcag_assistive_tech_protocol.md",
  "./accessibility_statement.md",
  "./psychometric_calibration_report.json",
  "./psychometric_item_summary.csv",
  "./pilot_response_template.csv",
  "./score_interpretation_report.json",
  "./standard_setting_protocol.md",
  "./score_claim_register.md",
  "./cut_score_policy.csv",
  "./cefr_interpretation_report.json",
  "./cefr_interpretation_matrix.csv",
  "./adaptive_readiness_report.json",
  "./adaptive_algorithm_spec.md",
  "./item_exposure_policy.md",
  "./adaptive_simulation_matrix.csv",
  "./data_visualization_readiness_report.json",
  "./category_c_visualization_matrix.csv",
  "./exam_protocol_report.json",
  "./exam_protocol_matrix.csv",
  "./section_randomization_report.json",
  "./section_randomization_matrix.csv",
  "./session_management_report.json",
  "./session_management_matrix.csv",
  "./visual_snapshot_report.json",
  "./visual_snapshot_matrix.csv",
  "./export_integrity_report.json",
  "./export_integrity_matrix.csv",
  "./qa_dashboard_report.json",
  "./hygiene_audit_report.json",
  "./bank_governance_report.json",
  "./item_lifecycle_policy.md",
  "./next_bank_authoring_plan.md",
  "./release_signoff_checklist.csv",
  "./operations_readiness_report.json",
  "./production_deployment_runbook.md",
  "./data_retention_policy.md",
  "./proctoring_integrity_policy.md",
  "./incident_response_runbook.md",
  "./bank_quality_review_report.json",
  "./construct_coverage_report.json",
  "./distractor_quality_report.json",
  "./blueprint_matrix.csv",
  "./manual_review_packet.md",
  "./review_queue.csv",
  "./expert_review_template.csv",
  "./expert_review_protocol.md",
  "./expert_adjudication_report.json",
  "./secure_delivery_api_spec.json",
  "./secure_delivery_blueprint.md",
  "./secure_delivery_readiness_report.json",
  "./pdf_report_pipeline_report.json",
  "./pdf/academic-assessment-candidate-report.pdf",
  "./pdf/academic-assessment-evaluator-report.pdf",
  "./pdf/academic-assessment-candidate-report-preview.png",
  "./pdf/academic-assessment-evaluator-report-preview.png",
  "./snapshot_desktop_learning.png",
  "./snapshot_category_c_visual.png",
  "./snapshot_admin_review.png",
  "./snapshot_mobile_initial.png",
  "./banned_phrase_registry.json",
  "./authoring_templates.md",
  "./assessment_platform_docs.md",
  "./CHANGELOG.md",
  "./app.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/academic_test_platform.html") || url.pathname.endsWith("/")) {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./academic_test_platform.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./academic_test_platform.html"))));
});
