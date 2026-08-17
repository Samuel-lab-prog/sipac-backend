# Architecture Overview

This document describes how the codebase is organized and how architectural
decisions are applied in practice.

It is intended as a **practical guide** for understanding, navigating, and
extending the system. Normative rules and enforcement details are documented in
the Architecture Decision Records (ADRs). This document focuses on _how to work
within those decisions_.

---

## Architectural Style

The system follows a **domain-oriented architecture**.

Instead of organizing code by technical layers (e.g. controllers, services,
repositories), the codebase is structured around **business domains**. Each
domain represents a cohesive area of responsibility and is expected to evolve
largely independently.

This approach prioritizes:

- explicit boundaries,
- reduced coupling,
- localized change,
- and long-term maintainability.

See:

- ADR-01.001 – Domain-based structure
- ADR-02.002 – Domain isolation rules

---

## High-Level Structure

At a high level, the system is composed of:

- **Domains**  
  Encapsulate business rules, policies, and invariants.

- **Use-cases**  
  Orchestrate application behavior by coordinating domain logic and external
  interactions through ports. Use cases are the heart of the application and
  represent the main sequence of operations.

- **Ports**  
  Define interfaces for communication between domains, internal layers, and
  external systems. Here, models, DTOs, and other data structures are defined to
  ensure clear contracts and decoupling.

- **Adapters**  
  Handle interaction with external systems (HTTP, CLI, messaging, etc.).

- **Infrastructure**  
  Contains all implementation for port interfaces. This includes database
  access, services like hashing, email sending, and any other external
  dependencies.

Each of these has a clearly defined responsibility and a restricted dependency
direction.

---

## Dependency Direction

Dependencies must follow a strict direction:

Adapters → Use-cases → Ports ← Infrastructure

Domains must not depend on use-cases or adapters. Domain here can be understood
as an abstract concept representing the core business logic, which should be
independent of any specific application flow or external interaction. Use-cases
depend on ports (interfaces). Infrastructure implements those ports but does not
depend on use-cases.

See:

- ADR-02.006 – Directional dependencies
- ADR-02.007 – Prohibition of circular dependencies

---

## Domain Boundaries

Domains are treated as **architectural units**, not just folders.

Key principles:

- No direct calls between domains unless explicitly allowed (i.e., only through
  a domain `public` contract).
- Cross-domain interaction must be explicit and intentional.
- Domains may duplicate code rather than introduce coupling.

Domain size, isolation, and dependency health are continuously measured and
classified.

See:

- ADR-01.004 – Domain size limits
- ADR-02.003 – No cross-domain calls
- ADR-02.007 – Prohibition of circular dependencies

---

## Entry Points and Isolation

Entry points (e.g. application bootstrap, main modules, controllers) are
considered volatile and must be kept isolated from business logic.

Business rules must not leak into:

- entry points,
- framework-specific code,
- or infrastructural glue.

Distance from entry points is treated as an architectural signal and measured
automatically.

See:

- ADR-02.001 – Orchestration boundaries exclusion
- ADR-01.005 – Distance from main sequence

---

## CQRS

The system follows a Command Query Responsibility Segregation (CQRS) pattern.

- **Commands** represent operations that change state and are handled by
  use-cases.
- **Queries** represent operations that read state and are handled by separate
  use-cases.

This separation promotes clear intent, better testability, and more flexible
evolution of read and write paths. It's not a strict requirement for all
operations, but is the default approach for new functionality.

---

## Testing Philosophy

Testing is an architectural concern, not an afterthought.

Key principles:

- Every use-case must be explicitly tested.
- Domains are expected to have a minimum level of internal test coverage.
- External tests (integration, E2E) complement but do not replace internal
  tests.

Testability is treated as a signal of architectural health and is enforced
through CI.

See:

- ADR-03.001 – Use cases tests
- ADR-03.002 – Domain tests

---

## Automation and Enforcement

Architectural rules in this system are **not advisory**.

Wherever possible, they are:

- measurable,
- automated,
- and enforced through the CI pipeline.

If CI fails due to an architectural rule, the system is considered invalid,
regardless of manual review.

Case-sensitive import paths are enforced. Import statements must match the
filesystem casing exactly to avoid Linux build failures.

See:

- ADR-04.001 – Linting rules
- ADR-04.002 – Mandatory code formatting
- ADR-04.003 – Reproducible and deterministic builds
- ADR-04.004 – CI as a gatekeeper
- ADR-04.005 – Use-case dependency contracts stay private
- ADR-04.006 – Use-case factories use a single explicit signature
- ADR-04.007 – Use-case errors must flow through the domain error alias
- ADR-04.008 – Use-case folders use kebab-case action names

---

## Architecture as a Living System

Architecture in this system is expected to evolve deliberately.

Changes to architectural rules must be:

- documented as ADRs,
- reviewed explicitly,
- and reflected in tooling when applicable.

Architectural metrics are treated as first-class signals to guide evolution, not
as absolute measures of quality.

See:

- ADR-05.001 – Architectural metrics
