# Human-Gated Authoring Templates

These templates are intentionally incomplete without human review. They are scaffolds for future ACC_301-600 work, not direct mass-generation instructions.

## Draft Item Object

```json
{
  "id": "ACC_301",
  "category": "A|B|C",
  "status": "draft",
  "sourceHorizon": "article-level source title + URL",
  "passage": "original assessment prose, not copied from source",
  "prompt": "construct-aligned question",
  "options": [
    "A",
    "B",
    "C",
    "D",
    "E"
  ],
  "correct": [
    "A"
  ],
  "rationale": "explain correct answer and every distractor trap",
  "reviewGate": [
    "lint",
    "expert-review",
    "source-check",
    "psychometric-pilot"
  ]
}
```

## Required Gates

- Lint: passage length, option count, answer key, banned phrases, source URL shape.
- Expert review: answer-key defensibility, distractor plausibility, natural academic English.
- Psychometric pilot: facility, discrimination, timing and confidence calibration.
- Retirement review: remove or rewrite items that are too easy, too hard, ambiguous or low-discrimination.
