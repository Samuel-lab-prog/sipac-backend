# Ports

This document describes how ports are defined, used, and implemented in this
codebase.

Ports are the formal boundary between application logic and external concerns
such as persistence, APIs, storage, hashing, or other infrastructure.

They enforce dependency direction and make use-cases testable.

---

## What Is a Port

A port is a TypeScript interface that defines how the application communicates
outward.

Ports:

- are owned by the application layer,
- describe required behavior, not implementations,
- are consumed by use-cases,
- are implemented by infrastructure modules.

Ports never contain logic. They only define contracts.

---

## Port Ownership and Location

Ports live inside each domain at:

```text
src/domains/<domain>/ports/
```

Shared contracts live under:

```text
src/shared-kernel/ports/
```

Typical domain port files:

- `models.ts`
- `commands.ts`
- `queries.ts`
- `externalServices.ts`
- `schemas/`

Schemas rule:

- every `ports/schemas/` folder must include an `Index.ts` barrel.

Rules:

- ports belong to the application, not to adapters or infra,
- ports must not import adapters, infra, Prisma, or framework routers,
- ports may import application-level models, DTOs, enums, and schemas.

This ensures dependency direction points inward.

See:

- ADR-02.006 – Directional dependencies

---

## Read vs Write Separation

Ports are split by intent, not by technical concerns.

This codebase separates:

- query ports for read-only operations,
- command ports for state-changing operations,
- external service ports for dependencies such as storage or hashing.

Example repository port names:

- `QueriesRepository`
- `CommandsRepository`

This separation:

- makes side effects explicit,
- simplifies reasoning about behavior,
- improves testability,
- aligns with use-case intent.

---

## Example Query Port

```ts
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../ports/models';

export interface QueriesRepository {
	selectActiveBanByUserId(params: {
		userId: number;
	}): Promise<BannedUserResponse | null>;

	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<SuspendedUserResponse | null>;
}
```

Key properties:

- the port defines what is needed, not how it is retrieved,
- return types are explicit and application-owned,
- nullable results are encoded in the type system,
- no infrastructure details leak into the interface.

---

## Who Uses Ports

Use-cases depend on ports to:

- query current state,
- perform state transitions,
- interact with external services.

Use-cases must:

- receive ports through dependency injection,
- treat ports as opaque abstractions,
- never assume implementation details.

Concrete wiring happens in `Composition.ts`.

---

## Implementations

Ports are implemented by infrastructure modules.

Typical locations:

- `infra/queries-repository/repository.ts`
- `infra/commands-repository/repository.ts`
- `infra/<something>-service/execute.ts`

Implementations:

- must fully satisfy the port interface,
- may depend on frameworks, ORMs, or external services,
- must not introduce application/business logic,
- must not return raw infrastructure shapes.

---

## Adapters and Ports

Adapters use port-owned schemas and service types to define the route boundary.

Adapters:

- receive external requests,
- validate input through schemas,
- call services that were assembled in `Composition.ts`.

Adapters must not:

- redefine port contracts,
- bypass ports to call infrastructure directly,
- choose concrete infrastructure implementations.

Example adapter locations:

- `adapters/CommandsRouter.ts`
- `adapters/QueriesRouter.ts`

---

## Schemas

Domain schemas live under `ports/schemas/` and use Elysia's schema utilities.

Rules:

- keep schemas close to the domain contract,
- export them through `ports/schemas/Index.ts`,
- keep response schemas in sync with returned application models,
- reuse shared schemas from `src/shared-kernel/Schemas.ts` when appropriate.

---

## Testing Strategy

- Ports enable isolated use-case tests.
- Use-cases test against mocked or fake ports.
- Infrastructure implementations are tested separately.
- Port interfaces themselves are not tested directly.

This allows:

- fast, isolated use-case tests,
- independent validation of infrastructure behavior.

See:

- ADR-03.001 – Use case tests
- ADR-03.002 – Domain tests

---

## What Ports Must Not Do

Ports must not:

- contain business logic,
- reference adapters or infra code,
- depend on framework routers,
- encode transport or persistence details,
- expose Prisma models or raw database rows.

If a port starts to feel smart, it is likely doing too much.

---

## Summary

Ports:

- define the application's external needs,
- enforce dependency inversion,
- decouple use-cases from infrastructure,
- enable isolated testing and architectural enforcement.
