# Tests

This document defines the **testing strategy** adopted in the codebase and how
tests relate to the architectural layers.

Tests exist to **protect behavior and boundaries**, not to inflate metrics.

---

## Testing Principles

- Tests reflect architectural responsibilities.
- Each test validates only the behavior of its own module.
- Coverage is a signal, not a goal.
- CI enforces the minimum guarantees defined by ADRs.

---

## Layer Responsibilities

### Use-Cases

- **Tests are mandatory.**
- Every use-case must have a corresponding test file.
- Tests must cover:
  - main execution flow,
  - error conditions,
  - boundary cases.

Rationale: Use-cases contain application logic and orchestration and must be
protected against regressions.

---

### Infrastructure (Infra)

- Tests are **strongly encouraged**, but not mandatory.
- Infra tests focus on:
  - query correctness,
  - data mapping,
  - edge cases.

Infra tests must not:

- re-test business rules,
- assert use-case behavior.

---

### Routers / Adapters

- Tests are **optional**.
- Router tests are useful only when:
  - routing logic is non-trivial,
  - error mapping is complex.

Thin routers with no logic do not require tests.

---

## Test Location

### Unit Tests

When unit tests exist, they must live **next to the module they test**.

Examples:

- `use-cases/commands/create-poem/execute.ts` →
  `use-cases/commands/create-poem/execute.test.ts`
- `infra/queries-repository/Repository.ts` →
  `infra/queries-repository/Repository.test.ts`

Rules:

- no central `__tests__` folders for unit tests,
- test location must reflect ownership.
- use-case folders should be kebab-case action names such as `create-poem`.

---

### Integration and End-to-End Tests

Integration tests live in `tests/integration/` and E2E tests live in
`tests/end2end/`.

These tests may:

- cross layers,
- hit real infrastructure,
- validate system behavior end-to-end.

They must not:

- replace unit tests,
- duplicate use-case coverage.

---

## Test Scope Rules

Tests must:

- test only the module under test,
- mock or stub external dependencies,
- avoid asserting implementation details.

Tests must not:

- rely on unrelated modules,
- validate behavior owned by another layer.

If a test needs multiple layers, it is not a unit test.

---

## Test Runner

All tests use:

- **Bun’s test runner**

Rules:

- no mixed test frameworks,
- consistent setup across the codebase,
- test execution must be deterministic.

---

## Summary

- Use-cases: **mandatory tests**
- Infra: **encouraged tests**
- Routers: **optional tests**
- Unit tests live next to the code
- Integration tests live in `/tests/integration`
- E2E tests live in `/tests/end2end`
- Bun is the single test runner

When unsure:

> Test where the responsibility lives — nowhere else.
