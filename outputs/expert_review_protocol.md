# Expert Adjudication Protocol

This protocol defines the human review evidence required before the bank can move beyond professional offline beta.

## Required CSV Fields

- `reviewer_id`: stable reviewer code, not personal contact data.
- `item_id`: item ID from `item_bank.json`.
- `decision`: one of `approve`, `revise`, `retire`, `second-review`.
- `construct_alignment`: `pass`, `concern` or `fail`.
- `key_defensibility`: `pass`, `concern` or `fail`.
- `distractor_plausibility`: `pass`, `concern` or `fail`.
- `language_quality`: `pass`, `concern` or `fail`.
- `source_scope`: `pass`, `concern` or `fail`.
- `severity`: optional reviewer severity label.
- `notes`: concise adjudication note.
- `reviewed_at`: ISO timestamp or review date.

## Completion Gate

- Every item needs at least two independent reviewer rows.
- Any `revise`, `retire`, `second-review`, `concern` or `fail` row keeps the item unresolved until a later adjudication round closes it.
- The automated report may say `completed-human-adjudication` only when all 300 items have two or more reviewer rows and zero unresolved items.

## Privacy

Reviewer IDs should be pseudonymous codes. Do not put personal email addresses, phone numbers, payment details or account identifiers into the CSV.
