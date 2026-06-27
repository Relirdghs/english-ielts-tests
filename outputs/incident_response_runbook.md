# Incident Response Runbook

## Trigger Conditions

- Candidate report exposes answer keys or rationales.
- Admin token boundary fails.
- Attempt storage loses submitted responses.
- PDF delivery exposes evaluator-only material.
- Source or score claim is found misleading.

## Response

1. Pause delivery.
2. Preserve logs.
3. Identify affected attempts.
4. Rotate runtime secrets.
5. Revoke exposed reports.
6. Publish corrected limitation or score notice.
7. Re-run all QA gates before reopening.
