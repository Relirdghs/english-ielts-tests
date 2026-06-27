# Secure Delivery Blueprint

Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.

## Purpose

The standalone HTML platform is useful for offline beta testing, but it cannot hide answer keys from a technically capable candidate. The secure delivery layer moves attempt creation, answer-key custody, scoring, reporting and audit events to a server process. Candidate endpoints receive only passages, prompts, options, public metadata and candidate-safe response summaries, and they require a per-attempt bearer token after attempt creation.

## Prototype Files

- `work/secure_delivery_server.js`: dependency-free Node.js HTTP prototype with local durable attempt storage.
- `work/qa_secure_delivery.js`: regression test for candidate authorization, redaction, scoring, storage, report rendering, audit log and admin authorization boundary.
- `secure_delivery_api_spec.json`: API contract and security invariants.
- `secure_delivery_readiness_report.json`: latest QA evidence for the secure delivery prototype.

## Candidate Flow

1. `POST /api/attempts` creates an attempt, returns the first safe item and returns a one-time candidate access token.
2. `POST /api/attempts/{attemptId}/responses` accepts selected letters and scores server-side when the candidate token is supplied.
3. `GET /api/attempts/{attemptId}` reads candidate-safe attempt state when the candidate token is supplied.
4. `POST /api/attempts/{attemptId}/finalize` returns the result summary when the candidate token is supplied.
5. `GET /api/attempts/{attemptId}/report/candidate` renders a printable candidate-safe HTML report when the candidate token is supplied.

## Evaluator/Admin Flow

Protected endpoints require a runtime environment bearer token. The token is not stored in repository files, generated outputs or remote configuration by this prototype. Authorized evaluator endpoints expose the full bank, persisted attempts, audit log rows and evaluator reports.

## Storage and Audit

The prototype writes attempts to local JSON and audit events to JSONL under `ASSESSMENT_STORAGE_DIR`, or `work/secure_delivery_data` by default. Candidate access tokens are stored only as hashes. Audit rows include action names, timestamps, bank version and scoped metadata, but never runtime tokens.

## Production Work Still Required

- Real authentication and role management.
- Managed durable attempt/session storage with backups and retention controls.
- TLS, rate limits, centralized audit logging and operational monitoring.
- Secure PDF rendering pipeline beyond printable HTML reports.
- Privacy policy, data retention policy and proctoring decision.
- Deployment-specific secret handling.
