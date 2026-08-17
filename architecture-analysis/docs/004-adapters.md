# Adapters

This document explains the role, responsibilities, and constraints of adapters
in this codebase.

Adapters translate external inputs into application calls. They form the
delivery layer and keep framework-specific concerns away from use-cases.

---

## What Is an Adapter

An adapter is a module that:

- receives requests from the outside world,
- validates and normalizes external input,
- invokes already-assembled application services,
- maps outputs to external responses.

Adapters do not contain business logic.

They connect the application to external systems while preserving clean
dependency boundaries.

---

## Adapter Ownership

Adapters live inside each domain under:

```text
src/domains/<domain>/adapters/
```

Typical files:

- `CommandsRouter.ts`
- `QueriesRouter.ts`

Rules:

- adapters may depend on framework APIs, schemas, and port-owned service types,
- adapters receive services from `Composition.ts`,
- adapters must not be depended on by use-cases or infra,
- adapters should not import concrete repositories or construct use-cases.

See:

- ADR-02.006 – Directional dependencies

---

## Commands vs Queries

Adapters are split by intent, mirroring use-cases and ports.

### Command Adapters

- Trigger state changes.
- Validate write-operation input.
- Call command services.

### Query Adapters

- Perform read-only operations.
- Call query services.
- Must not cause side effects.

This separation keeps read/write boundaries easy to reason about.

---

## Responsibilities of Adapters

Adapters are responsible for:

- route definition,
- input validation at the boundary,
- extracting raw params/body/query/auth,
- calling services passed into the router factory,
- declaring response schemas and route metadata,
- mapping use-case results to external formats when necessary.

Adapters are not responsible for:

- business rules,
- persistence logic,
- dependency assembly,
- cross-use-case business coordination.

If logic becomes reusable or domain-related, it belongs elsewhere.

---

## Routers

Router files define how external requests are mapped to services.

Examples:

- `QueriesRouter.ts`
- `CommandsRouter.ts`

Routers:

- define routes or entry points,
- extract raw input,
- delegate to services supplied by `Composition.ts`.

Routers must remain thin and free of business logic.

---

## Services Object

Routers are usually created by a factory that accepts a services object.

Typical flow:

1. `Composition.ts` assembles use-cases from factories.
2. `Composition.ts` groups them into a typed services object.
3. `Composition.ts` passes the services object to the router factory.
4. Router handlers call the services.

This keeps routers from knowing which infrastructure implementation backs a
service.

---

## Dependency Injection

Concrete dependency injection belongs in `Composition.ts`, not in router
handlers.

Adapters may define the service shape they need through port-owned types, but
they should not:

- import concrete infra,
- choose implementations,
- instantiate repositories,
- construct use-case factories in handlers.

This keeps use-cases:

- framework-agnostic,
- easy to test,
- isolated from infrastructure concerns.

---

## Interaction with Ports

Adapters:

- use port-owned schemas and service types,
- receive services that satisfy those types,
- keep route-level input/output contracts aligned with port models.

Adapters must never:

- redefine port contracts,
- expose infrastructure types upward,
- leak persistence details.

See:

- `ports/queries.ts`
- `ports/commands.ts`
- `ports/schemas/Index.ts`

---

## Interaction with Infrastructure

Adapters should not import infrastructure implementations directly. Concrete
infrastructure is imported by `Composition.ts` and passed into use-case
factories there.

Rules:

- composition chooses implementations,
- adapters expose routes,
- infrastructure never chooses adapters,
- use-cases never know implementations exist.

At no point does infrastructure reference adapters or use-cases.

---

## Validation and Schemas

Adapters use schemas to validate external input before invoking services.

Rules:

- schemas are used at boundaries,
- use-cases receive normalized application input,
- validation errors are handled by adapters and shared schema helpers.

---

## Error Handling

Adapters:

- translate use-case errors into external error formats through shared plugins,
- declare expected error schemas where useful,
- avoid leaking internal error types or persistence errors.

Use-case errors should be:

- domain-specific,
- explicit,
- mapped consistently at the boundary.

---

## Testing Strategy

Adapter tests are optional. Prefer testing the use-cases that adapters call.

Router tests are useful only when:

- routing logic is non-trivial,
- error mapping is complex,
- request normalization has meaningful behavior.

Thin routers with no logic do not require direct tests.

---

## What Adapters Must Not Do

Adapters must not:

- implement business rules,
- perform persistence logic,
- call repositories directly,
- coordinate multiple use-cases for business decisions,
- hide dependency construction in route handlers.

Violations usually indicate misplaced logic.

---

## Summary

Adapters:

- are delivery-layer entry points,
- translate external input to application calls,
- enforce clean boundaries,
- keep business logic isolated and testable.

When unsure:

> If the code is about how to talk to the outside world, it belongs in an
> adapter. If the code chooses concrete dependencies, it belongs in
> `Composition.ts`.
