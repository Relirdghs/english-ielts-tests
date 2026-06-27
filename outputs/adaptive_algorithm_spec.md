# Adaptive Algorithm Specification

Bank version: ACC-C1C2-2026.27. Schema: 2.25.0.

## Current Mode

The runtime adaptive mode is a heuristic diagnostic drill. It uses submitted performance to prioritize weaker skill modules while preserving the existing item bank constraints.

## Candidate Label

Use `Adaptive drill`. Do not label it as `calibrated adaptive exam` until IRT/CAT calibration and simulations are complete.

## Selection Rules

- Start from a balanced category and difficulty spread.
- Prefer the weakest submitted skill after enough responses exist.
- Keep option randomization mapped to source answer keys.
- Avoid overexposing any narrow source-domain pool.
- Preserve review and rationale rules for learning, integrity and blind-review modes.

## CAT Upgrade

A production CAT upgrade requires calibrated item parameters, standard error stop rules, exposure controls, fairness checks and expert signoff.
