# Production Deployment Runbook

Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.

## Release Steps

1. Freeze bank JSON and generated artifacts.
2. Run content, source, accessibility, hygiene, governance, score and secure-delivery QA.
3. Verify no local secure-delivery data remains in the worktree.
4. Deploy server-backed delivery behind hosted authentication.
5. Configure managed database, backups, logs and report retention.
6. Run smoke tests for candidate, evaluator and admin roles.
7. Record release owner, version, rollback target and known limitations.

## Rollback

Rollback if candidate redaction fails, admin auth fails, report access leaks evaluator-only content, storage writes fail or QA dashboard records a failed gate.
