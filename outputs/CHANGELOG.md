# Changelog

## ACC-C1C2-2026.27

- Added section-preserving randomized question order for full-exam attempts.
- Added deterministic question-order snapshots to saved sessions and JSON exports.
- Added section randomization readiness report, matrix, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.26

- Added runtime CEFR profile explanations using weighted score, confidence-adjusted score, coverage and weakest submitted module.
- Added CEFR rationale to candidate/evaluator reports and JSON analytics payloads.
- Added CEFR interpretation readiness report, matrix, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.25

- Added named local session slots with persisted labels and active-slot metadata in session snapshots.
- Added session management readiness report and matrix artifacts.
- Added named-slot browser QA, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.24

- Added full-exam protocol with three 90-minute sections, two persisted break checkpoints and final-protocol readiness state.
- Added exam protocol evidence to JSON exports, documentation, service-worker cache, manifest and QA dashboard gating.
- Added exam protocol readiness report and section matrix artifacts.

## ACC-C1C2-2026.23

- Added persistent collapsible analytics sections for CEFR, skills, confidence, history, review, export and reading settings.
- Added mobile UX evidence for analytics collapsing, ARIA expansion state and persisted panel preferences.
- Added collapsible analytics evidence to readiness, documentation and browser QA gating.

## ACC-C1C2-2026.22

- Added export integrity QA for JSON, CSV, candidate report, evaluator report and PDF print surface.
- Added candidate/evaluator leakage checks against runtime report downloads.
- Added export integrity evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.21

- Added visual snapshot QA for desktop learning, Category C visualization, admin review and mobile initial states.
- Added screenshot pixel sanity checks, viewport assertions and visual snapshot matrix artifacts.
- Added snapshot evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.20

- Added accessible Category C mini-graphs for estimates, intervals, sensitivity and missingness.
- Added data visualization readiness report and Category C visualization matrix.
- Added visualization evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.

## ACC-C1C2-2026.19

- Added adaptive readiness report, adaptive algorithm spec, item exposure policy and simulation matrix.
- Added adaptive evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.
- Separated current heuristic adaptive drill from future calibrated IRT/CAT production claims.

## ACC-C1C2-2026.18

- Added operations readiness report plus deployment, retention, proctoring and incident response runbooks.
- Added operations evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.
- Added controlled-beta versus production operations blockers for hosting and support readiness.

## ACC-C1C2-2026.17

- Added provisional score interpretation report, cut-score policy, score claim register and standard-setting protocol.
- Added score interpretation evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.
- Added production blockers for standard setting so CEFR-style bands remain diagnostic until calibrated.

## ACC-C1C2-2026.16

- Added bank governance report, lifecycle policy, next-bank authoring plan and release signoff checklist.
- Added governance evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.
- Added future-bank controls for stable IDs, no direct mass approval, source-set separation and release ownership.

## ACC-C1C2-2026.15

- Added no-secrets/no-email/no-CDN hygiene audit script and output artifact.
- Added hygiene evidence to readiness, documentation, service-worker cache, manifest and QA dashboard gating.
- Updated deep audit to require a clean hygiene report before release evidence is considered complete.

## ACC-C1C2-2026.14

- Added construct coverage report, blueprint matrix and distractor quality report artifacts.
- Expanded automated bank QA with weak-distractor counts, option cue profiles and trap coverage evidence.
- Added new bank quality artifacts to readiness, documentation, service-worker cache, manifest and dashboard gating.

## ACC-C1C2-2026.13

- Added skip-link, landmark and live-region accessibility improvements to the standalone runtime.
- Added WCAG conformance matrix, accessibility statement and assistive-technology audit protocol artifacts.
- Expanded automated accessibility checks for landmarks, skip link, progress navigation and status messaging.

## ACC-C1C2-2026.12

- Added per-attempt candidate bearer tokens for secure delivery candidate endpoints.
- Added hash-only candidate token persistence and authorization-denial audit rows.
- Expanded secure delivery QA and API documentation for candidate authorization boundaries.

## ACC-C1C2-2026.11

- Added a secure PDF report rendering prototype using ReportLab, pypdf and Poppler preview rendering.
- Added candidate/evaluator PDF separation checks to prevent candidate report leakage.
- Added PDF pipeline evidence to readiness, manifest, documentation and QA dashboard gates.

## ACC-C1C2-2026.10

- Added local durable attempt storage and JSONL audit logging to the secure delivery prototype.
- Added candidate-safe and protected evaluator report endpoints to the server-backed flow.
- Expanded secure delivery QA to verify persistence, redaction, audit rows and report authorization.

## ACC-C1C2-2026.9

- Added a dependency-free secure delivery server prototype with candidate payload redaction and server-side scoring.
- Added secure delivery API spec, deployment blueprint and automated boundary QA report.
- Added secure delivery artifacts to readiness, service-worker cache, manifest and dashboard gating.

## ACC-C1C2-2026.8

- Added expert adjudication CSV template, protocol and validator report for human review evidence.
- Added admin-side expert review import/template controls to the standalone runtime.
- Added expert adjudication coverage to readiness, QA dashboard and deep audit gates.

## ACC-C1C2-2026.7

- Added per-item timing and answer-history protocol to local sessions, save slots and JSON export.
- Added confidence-adjusted scoring to analytics, CSV export and printable reports.
- Added separate candidate and evaluator report exports with cleaner candidate-mode metadata and sticky mobile answer controls.

## ACC-C1C2-2026.6

- Added automated bank quality review report for semantic similarity, banned phrases and obvious-answer risks.
- Added manual expert review packet, review queue CSV, banned phrase registry and human-gated authoring templates.
- Added review workflow artifacts to readiness, service-worker cache and manifest.

## ACC-C1C2-2026.5

- Added pilot-response psychometric calibration tooling and output templates.
- Added QA dashboard rollup for content, source, accessibility, psychometric and readiness gates.
- Added admin-surface support for local pilot response import and calibration status.

## ACC-C1C2-2026.4

- Added runtime import/export for compatible item bank JSON files.
- Added generated PWA manifest and service worker artifacts for hosted offline install mode.
- Added automated accessibility audit output to the QA gate.

## ACC-C1C2-2026.3

- Added item-level source verification metadata, uniqueness score, semantic signature, distractor plausibility rating, manual review checklist and retirement rule.
- Added structured data displays for Category C items and generated Markdown tables from the same data.
- Added source verification, readiness and documentation artifacts to the build output.

## ACC-C1C2-2026.2

- Added canonical item bank, assessment metadata, confidence marking, review filters, save slots, reading settings and JSON/CSV export.
