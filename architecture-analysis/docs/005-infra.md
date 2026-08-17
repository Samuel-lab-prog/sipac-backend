# Infrastructure (Infra)

This document describes the **infrastructure layer** of the system: its role,
responsibilities, constraints, and interaction with the rest of the
architecture.

Infrastructure is the layer that **talks to concrete technologies** such as
databases, ORMs, external services, and system resources.

---

## Purpose of the Infrastructure Layer

The infrastructure layer exists to:

- implement port interfaces,
- interact with databases and external systems,
- translate low-level data into application-level models,
- encapsulate technical details.

Infrastructure **must not** contain business logic.

---

## Position in the Architecture

Infra is a **leaf layer**.

Dependency direction:

Adapters → Use-cases → Ports ← Infra → External Systems

Infrastructure:

- depends on ports,
- depends on external libraries,
- is never depended on by use-cases or domains.

See:

- ADR-02.006 – Directional dependencies
- ADR-02.007 – Prohibition of circular dependencies

---

## Directory Structure

Infra lives inside each domain at `src/domains/<domain>/infra/`.

Typical structure (per domain):

`infra/queries-repository/repository.ts` `infra/queries-repository/selects.ts`
`infra/queries-repository/helpers.ts` `infra/queries-repository/helpers.test.ts`
`infra/commands-repository/repository.ts` `infra/commands-repository/selects.ts`
`infra/commands-repository/helpers.ts`
`infra/commands-repository/helpers.test.ts` `infra/<something>-service/...`

Rules:

- infra may only contain `commands-repository`, `queries-repository`, or
  `<something>-service` folders,
- infra must not contain files directly at its root.
- inside `commands-repository` or `queries-repository`, only the following files
  are allowed: `repository.ts`, `selects.ts`, `helpers.ts`, `helpers.test.ts`,
- `repository.ts` is mandatory; the other files are optional.

Each repository:

- implements a port,
- encapsulates all persistence logic,
- exposes a single exported object.

---

## Repository Pattern

Infrastructure repositories are **concrete implementations of ports**.

Example:

- `QueriesRepository`
- `CommandsRepository`

Rules:

- infra repositories must implement port interfaces exactly,
- method signatures must match ports,
- infra must not redefine domain models.

---

## Example: Queries Repository

A typical queries repository:

- uses Prisma directly,
- performs database queries,
- maps raw data to application models,
- handles technical errors.

Example responsibilities:

- SQL/ORM queries,
- joins and selects,
- ordering and filtering,
- mapping results.

---

## ORM and Database Access

The infrastructure layer is the **only place** where:

- Prisma is imported,
- database schemas are referenced,
- ORM-specific APIs are used.

Rules:

- Prisma must not leak outside infra,
- use-cases must never import Prisma,
- adapters must not query the database directly.

---

## Error Handling

Infrastructure is responsible for handling **technical errors**.

Example:

- database connection issues,
- constraint violations,
- unexpected ORM behavior.

Errors are wrapped or normalized using helpers such as:

- `withPrismaErrorHandling`

Rules:

- infra errors must not leak ORM-specific exceptions upward,
- infra must return either valid data or throw normalized errors,
- business errors are not handled here.

---

## Data Mapping

Infrastructure **maps persistence models to application models**.

Common patterns:

- `selects.ts` defines database projections,
- `helpers.ts` maps raw results into models,
- mapping functions are pure and reusable.

Rules:

- mapping must be explicit,
- no implicit shape assumptions,
- no logic beyond transformation.

---

## Select Definitions

Select objects:

- define which fields are fetched,
- prevent over-fetching,
- centralize database shape decisions.

Example responsibilities:

- projection control,
- reuse across queries,
- consistency in returned data.

Selects must:

- stay infra-local,
- never be reused outside infra.

---

## Port Compliance

Infrastructure repositories must:

- fully implement the port contract,
- return the correct types,
- respect nullability and error semantics.

Infra must not:

- add extra methods,
- expose ORM entities,
- return raw database rows.

---

## Testing Strategy

Infrastructure is tested using:

- real or isolated databases,
- test containers or local instances,
- repository-level tests.

Focus of infra tests:

- correctness of queries,
- correctness of mappings,
- correct handling of edge cases.

Infra tests do **not** test:

- business rules,
- use-case behavior.

---

## What Infrastructure Must Not Do

Infrastructure must not:

- contain business rules,
- coordinate multiple use-cases,
- call adapters,
- depend on other infra modules.

If infra starts making decisions, logic is misplaced.

---

## Stability and Replaceability

A core goal of infra is **replaceability**.

Because infra depends only on ports:

- Prisma can be replaced,
- databases can change,
- implementations can evolve.

Use-cases remain untouched.

---

## Summary

Infrastructure:

- implements ports,
- isolates technical concerns,
- talks to databases and external systems,
- keeps the core application clean.

When unsure:

> If the code knows _how data is stored or retrieved_, it belongs in infra.
