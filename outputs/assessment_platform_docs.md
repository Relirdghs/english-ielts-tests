# Academic Assessment Platform Documentation

## Source of Truth

`item_bank.json` is the canonical bank. The Markdown database and standalone HTML platform are generated from the same item objects. The standalone app also supports importing a compatible bank JSON at runtime, so future banks can be tested without editing the generated HTML.

## Adding New Items

New items should enter as `draft`, pass lint, receive manual expert review, and only then move to `approved`. Each item needs an article-level source horizon, original passage text, five options, an answer key, rationale, difficulty tier, skill module, cognitive trap types, time estimate, scoring weight, source domain and retirement rule.

## Manual Review

Reviewers should check construct alignment, natural academic English, distractor plausibility, answer-key defensibility, rationale specificity, source-scope discipline and Category C data consistency. A reviewer should not approve items whose correct option is obvious by length, modality or generic caution alone. `manual_review_packet.md` and `review_queue.csv` are triage aids; they do not mean expert adjudication has already been completed.

## Blueprint and Quality Reports

`construct_coverage_report.json` maps category, skill module and difficulty-tier cells to item counts, source-domain spread and trap coverage. `blueprint_matrix.csv` gives reviewers a compact matrix for spotting overrepresented domains and thin construct cells. `distractor_quality_report.json` records option-length, modality and plausibility signals so weak distractors can be revised before expert signoff.

## Hygiene Audit

`work/hygiene_audit.js` scans generated text artifacts and local work scripts for unexpected email literals, token-shaped secrets, remote script dependencies, CDN references, non-local plain HTTP URLs and leftover secure-delivery storage. The report is written to `hygiene_audit_report.json` and is part of the QA dashboard.

## Adaptive Readiness

`work/build_adaptive_readiness.js` writes `adaptive_readiness_report.json`, `adaptive_algorithm_spec.md`, `item_exposure_policy.md` and `adaptive_simulation_matrix.csv`. These artifacts separate the current heuristic adaptive drill from future calibrated CAT, and define exposure, pool and upgrade requirements.

## Category C Visualizations

`work/build_data_visualization_readiness.js` writes `data_visualization_readiness_report.json` and `category_c_visualization_matrix.csv`. Category C items include accessible mini-graphs that encode adjusted estimates, uncertainty intervals, sensitivity checks and missingness, while preserving table data for screen-reader and export review.

## Full Exam Protocol

`work/build_exam_protocol_readiness.js` writes `exam_protocol_report.json` and `exam_protocol_matrix.csv`. The offline runtime exposes three 90-minute sections, break checkpoints after Sections A and B, per-section progress, persisted break state and a final-protocol readiness flag in JSON exports.

## Section Randomization

`work/build_section_randomization_readiness.js` writes `section_randomization_report.json` and `section_randomization_matrix.csv`. Random question order now shuffles items inside A/B/C sections while preserving full-exam section boundaries, with deterministic seeds and `session.questionOrder` evidence in JSON exports.

## Session Management

`work/build_session_management_readiness.js` writes `session_management_report.json` and `session_management_matrix.csv`. The runtime supports default slots, named local attempts, persisted slot labels, active-slot restore and slot metadata in JSON session snapshots.

## Snapshot QA

`work/visual_snapshot_qa.js` writes `visual_snapshot_report.json`, `visual_snapshot_matrix.csv` and four viewport screenshots. It checks desktop learning, Category C visualization, admin review and mobile initial states for nonblank images, expected dimensions, layout assertions and overflow.

## Bank Governance

`work/build_bank_governance.js` writes `bank_governance_report.json`, `item_lifecycle_policy.md`, `next_bank_authoring_plan.md` and `release_signoff_checklist.csv`. These artifacts define stable item IDs, release ownership, next-bank namespace policy, no direct mass approval and the evidence required before future banks can move from draft to approved.

## Operations Readiness

`work/build_operations_readiness.js` writes `operations_readiness_report.json`, `production_deployment_runbook.md`, `data_retention_policy.md`, `proctoring_integrity_policy.md` and `incident_response_runbook.md`. These artifacts separate controlled-beta readiness from production hosting requirements for authentication, storage, report delivery, monitoring, retention, proctoring and incident response.

## Expert Adjudication

`expert_review_template.csv` is the machine-readable reviewer input format. `work/validate_expert_adjudication.js` validates reviewer rows and writes `expert_adjudication_report.json`. The expert-review gate remains pending until all 300 items have at least two independent reviewer rows and no unresolved revise, retire or second-review decisions.

## Scoring

Single-select items receive 1 point for exact match. Multiple-select items use partial credit: correct selections ratio minus a wrong-selection penalty, floored at 0. Weighted analytics use each item's scoring weight. Confidence-adjusted analytics apply a small calibration adjustment: high-confidence misses reduce the adjusted contribution, high-confidence correct answers receive a small positive signal, and low-confidence correct answers receive a small caution signal.

## Score Interpretation

`score_interpretation_report.json` defines provisional C1/C2 bands, interpretation boundaries, allowed score claims and production blockers. `standard_setting_protocol.md` documents the required expert-panel method before cut scores can become production claims. `score_claim_register.md` separates allowed diagnostic claims from claims that remain prohibited until calibration and standard setting are complete.

## CEFR Explanation

`work/build_cefr_interpretation_readiness.js` writes `cefr_interpretation_report.json` and `cefr_interpretation_matrix.csv`. The runtime explains each C1/C2 profile from weighted score, confidence-adjusted score, answered coverage and weakest submitted module, while preserving a visible limitation that bands are provisional until calibration and standard setting are complete.

## Session Protocol and Reports

The runtime stores per-item time spent, submitted answer history, source/display answer mappings, confidence, scoring version and evaluator notes in local session state. Candidate reports hide answer keys and rationales, while evaluator reports include answer keys, rationales, item metadata, timing and manual notes.

## Collapsible Analytics

The analytics sidebar uses persistent collapsible sections for CEFR profile, competence breakdown, skill modules, confidence calibration, answer history, review, export and reading settings. This keeps mobile and repeated-review workflows compact without removing the underlying analytics evidence.

## Export Integrity

`work/export_integrity_qa.js` writes `export_integrity_report.json` and `export_integrity_matrix.csv`. It downloads runtime JSON, CSV, candidate and evaluator reports, validates core payload fields, checks candidate/evaluator information boundaries and confirms the PDF print surface is wired.

## Secure Delivery

`work/secure_delivery_server.js` is a dependency-free Node.js prototype for teacher/candidate separation. Candidate endpoints return redacted item payloads, persist attempt state, render candidate-safe reports and score responses server-side only when a per-attempt candidate bearer token is supplied. The server stores only candidate token hashes. Protected admin endpoints expose evaluator-only bank data, persisted attempts, audit rows and evaluator reports behind a runtime environment bearer token. The prototype does not replace production hosted authentication, managed storage, backups, TLS, rate limits, centralized logs or proctoring controls.

## PDF Reporting

`work/render_secure_report_pdfs.py` renders sample candidate and evaluator PDF reports from the canonical bank. The candidate PDF is checked for evaluator-only material redaction; the evaluator PDF is checked for answer-key and rationale presence. Poppler preview rendering verifies that first-page PDF output can be visually inspected before release.

## Accessibility

The standalone runtime includes a skip link, semantic banner/main/aside landmarks, labelled control groups, labelled progress navigation, visible focus states, contrast checks and a polite status region for item changes. `wcag_conformance_matrix.json` maps automated evidence to WCAG criteria. `wcag_assistive_tech_protocol.md` is the required manual screen-reader and keyboard audit protocol before claiming formal conformance.

## Psychometric Calibration

`pilot_response_template.csv` defines the accepted pilot response format: candidate ID, item ID, selected answer, score, confidence, time and timestamp. `work/calibrate_psychometrics.js` reads a supplied CSV or JSON response file and writes facility index, discrimination index, timing and retirement-review recommendations. Without real pilot response rows the report remains `awaiting-pilot-data`; it must not be treated as completed calibration.

## Known Limitations

The current passages are original assessment prose based on source horizons; they are not copied article excerpts. Psychometric fields are target values until pilot candidate data exists. Offline HTML cannot enforce secure hidden answer keys against a technically capable user; secure teacher/candidate separation requires a server-backed deployment. PWA install mode requires serving `academic_test_platform.html`, `app.webmanifest` and `sw.js` over http(s).

## Roadmap

Next bank expansion should produce ACC_301-600 from a new source set, but only through the draft -> lint -> expert review -> approved pipeline. Future releases should add pilot calibration, secure evaluator workflows, server-side candidate delivery and production deployment controls.
