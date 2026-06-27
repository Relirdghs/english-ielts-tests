# Item Lifecycle Policy

Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.

## Stable IDs

Current IDs use `ACC_001` through `ACC_300`. Future IDs start at `ACC_301`. Retired IDs remain reserved and must never be reused.

## Lifecycle

`draft -> linted -> expert-review -> approved -> retired` is the only supported item lifecycle. Automated lint can move an item into review readiness, but only human adjudication can approve it for production claims.

## Required Evidence

- Source horizon record with article-level URL.
- Construct and difficulty metadata.
- Distractor plausibility evidence.
- Manual review checklist.
- Expert adjudication rows.
- Pilot psychometric rows before calibration claims.

## Retirement

Retire or revise items with negative discrimination, extreme facility, unresolved expert disagreement, weak distractors, source-scope ambiguity or misleading timing behaviour.
