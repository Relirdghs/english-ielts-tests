# WCAG Assistive Technology Audit Protocol

Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.

## Scope

Audit the standalone candidate runtime, review screen, exports, admin/evaluator controls and mobile layout.

## Required Environments

- Windows + Edge + NVDA.
- macOS + Safari + VoiceOver.
- iOS Safari + VoiceOver.
- Keyboard-only desktop browser.
- 200% browser zoom.

## Critical Flows

1. Open platform and use the skip link to reach the current question.
2. Navigate the progress map and confirm the active item is announced.
3. Read a passage, prompt, answer options, data table and Category C mini-graph.
4. Select options, set confidence and submit.
5. Verify review locking in exam mode and rationale disclosure in learning mode.
6. Use review filters, search, save slot controls and export controls.
7. Import a bank JSON and confirm failure messaging is announced.

## Signoff Fields

Record tester, assistive technology, browser, device, date, pass/fail, blocker severity, reproduction notes and remediation owner for each flow.
