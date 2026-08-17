# Dependency Injection

This document describes how dependency injection is performed in the application
and where object composition is allowed.

Injection is assembly code. It connects abstractions to implementations, but it
must not contain business logic.

---

## Purpose

The injection layer is responsible for:

- wiring concrete implementations to ports,
- assembling use-cases from factories,
- passing ready-to-use services to adapters.

It is the place where abstractions meet implementations.

---

## Position in the Architecture

Injection sits at the edge of each domain.

In the current codebase, the main composition root for a domain is:

```text
src/domains/<domain>/Composition.ts
```

`Composition.ts` may import:

- concrete infrastructure implementations,
- use-case factories,
- public contracts from other domains,
- adapter factory functions.

It wires these pieces together and exports ready-to-use routers.

Rules:

- use-cases never import infra,
- infra never imports use-cases,
- routers should receive already-assembled services,
- composition imports both abstractions and implementations only to connect
  them.

---

## Factory Wiring

Use-cases are created through factories.

Typical flow:

1. `Composition.ts` imports repository or service implementations from `infra`.
2. `Composition.ts` imports the use-case factory.
3. `Composition.ts` passes concrete dependencies into the factory.
4. `Composition.ts` builds a services object for the router.
5. The router receives the services object and calls it from HTTP handlers.

This keeps use-cases:

- stateless,
- testable,
- framework-agnostic,
- isolated from infrastructure concerns.

Use-case factories are expected to be named exports ending with `Factory` and to
accept a single dependency contract parameter. See ADR-04.006.

---

## Routers Are Not Composition Roots

Routers live in `adapters/CommandsRouter.ts` and `adapters/QueriesRouter.ts`.

Routers should:

- define routes,
- validate external input,
- extract params/body/query/auth,
- call services passed into the router factory,
- map responses and route metadata.

Routers should not:

- import concrete repositories,
- construct use-cases,
- choose infrastructure implementations,
- contain business rules.

---

## Stability Rules

Injection code:

- contains no business logic,
- contains no validation rules,
- contains no persistence logic,
- contains no conditional business decisions.

Its only responsibility is assembly.

If assembly starts needing real decisions, move that logic to a use-case,
policy, adapter validation helper, or infrastructure mapper depending on the
responsibility.

---

## Summary

Dependency injection:

- wires dependencies explicitly,
- keeps use-cases pure,
- isolates infrastructure details,
- makes architecture enforceable.

If code decides what to do, it is not injection. If code decides what to
connect, it is.
