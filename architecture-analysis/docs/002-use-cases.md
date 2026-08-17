# Use Cases

This document describes how use-cases are structured, implemented, and tested in
this codebase.

Use-cases are the core application boundary. They define what the system does in
response to a request, independent of delivery mechanisms, frameworks, and
infrastructure.

Normative constraints are defined in ADRs. This document explains how to apply
them in practice and summarizes the conventions that make those rules easier to
follow.

---

## What Is a Use Case

A use-case represents a single application action or business capability.

Examples:

- accept a friend request,
- create an account,
- publish a poem,
- cancel a subscription.

A use-case:

- orchestrates domain logic,
- enforces business rules,
- coordinates reads and writes through ports,
- returns a meaningful result or throws a domain error.

It is not a controller, service, or repository.

---

## Responsibilities

A use-case is responsible for:

- validating input at the application level,
- enforcing business invariants,
- querying current state when needed,
- executing state-changing commands,
- deciding what happens next.

A use-case is not responsible for:

- HTTP concerns,
- persistence details,
- framework-specific behavior,
- formatting responses for clients.

---

## Dependency Model

Use-cases depend only on:

- domain policies and invariants,
- ports for external interaction, models, and DTOs.

They must not depend on:

- adapters,
- frameworks,
- concrete infrastructure implementations.

Dependency direction:

```text
Adapters -> Use-cases -> Ports <- Infrastructure
```

See:

- ADR-02.006 – Directional dependencies

---

## Factory Pattern for Use Cases

Use-cases must be created through factory functions that receive their
dependencies explicitly.

This enables:

- dependency inversion,
- testability,
- isolation from infrastructure.

### Recommended Pattern

```ts
import type { SomePort, AnotherPort } from '../ports/queries';
import type { SomeDomainModel } from '../ports/models';
import { BadRequestError } from '@DomainError';
import { SomePolicy } from '../policies/Policies';

interface Dependencies {
	dependencyA: SomePort;
	dependencyB: AnotherPort;
}

export type SomeUseCaseParams = {
	// Export this type when adapters or tests need the use-case input shape.
};

export function someUseCaseFactory({ dependencyA, dependencyB }: Dependencies) {
	return async function someUseCase(
		params: SomeUseCaseParams,
	): Promise<SomeDomainModel> {
		if (somethingIsWrong(params)) throw new BadRequestError('Invalid input');

		const someData = await dependencyA.fetchSomething(params);

		if (!SomePolicy.isSatisfied(someData))
			throw new BadRequestError('Business rule violation');

		return dependencyB.executeCommand(someData);
	};
}
```

Key properties of this pattern:

- dependencies are injected once,
- the returned function is pure application logic,
- infrastructure is bound at the edge through `Composition.ts`.
- the internal `Dependencies` type stays local to the file and is not exported.
- the factory is a named export whose name ends with `Factory`.
- the factory accepts exactly one dependency contract parameter.

This example demonstrates:

- explicit dependency injection,
- orchestration through ports,
- business rule enforcement,
- domain-level error signaling,
- no framework, adapter, or infrastructure leakage.

This pattern is enforced in `metrics:analysis` and documented in ADR-04.005,
ADR-04.006, and ADR-04.007.

---

## Error Handling

Use-cases signal failure by throwing domain or application errors. In this
codebase, domain error types are centralized in `@DomainError`, while
`AppError.ts` handles higher-level application errors.

Rules:

- errors must be meaningful and explicit,
- errors belong to the domain or application layer,
- adapters are responsible for translating errors to external representations
  such as HTTP status codes,
- use-cases must not return error codes or status objects.

Use-cases must not catch errors just to rethrow generic ones. Preserve useful
dependency errors unless there is a clear domain translation to perform.

Error imports in use-cases, their policy helpers, and their tests must come from
`@DomainError`. Direct imports from internal error modules are disallowed and
enforced in `metrics:analysis`.

---

## Naming and Scope

Guidelines:

- one use-case per file,
- one exported factory per use-case,
- factory names must end with `Factory`,
- use-case implementation files should keep a local `interface Dependencies`,
- use-case folders must use kebab-case names such as `create-poem`,
- names must describe an action,
- prefer verb-based names,
- avoid "manager", "service", or "handler" suffixes.

Good:

- `acceptFriendRequest`
- `publishPoem`

Bad:

- `friendshipService`
- `userManager`

---

## Testing Requirements

Every use-case must have a corresponding test file named `execute.test.ts`.

Tests must:

- invoke the use-case directly,
- mock or fake ports,
- cover success and failure scenarios,
- avoid adapters and entry points.

A use-case without tests is considered incomplete.

See:

- ADR-03.001 – Use case tests
- ADR-03.002 – Domain tests

---

## What to Avoid

Use-cases must not:

- access databases directly,
- import adapters or frameworks,
- import concrete infrastructure,
- contain presentation logic,
- call other domains directly,
- hide dependencies through globals or singletons.

Violations are detected and enforced through CI.

---

## Conventions

- Use-cases live under the `use-cases/` directory.
- Each use-case folder contains:
  - `execute.ts` with the factory function,
  - `execute.test.ts` with tests.
- CQRS folders are used by default:
  - commands in `commands/`,
  - queries in `queries/`.
- The only allowed folders directly under `use-cases/` are:
  - `commands/`,
  - `queries/`,
  - `policies/`,
  - `test-helpers/`.
- Any other folder or file at the `use-cases/` root is a violation.
- Use-case action folders under `commands/` and `queries/` must use kebab-case.
- Models and DTOs are defined in `ports/` and imported from there.
- Use-cases should not import models from other domains directly; use public
  contracts or ports.
- Error imports in use-case code, policies, and tests must use `@DomainError`.

---

## Summary

Use-cases are:

- the center of application behavior,
- explicit, testable, and deterministic,
- independent of infrastructure,
- governed by architectural rules.

When in doubt, keep the use-case focused on what the application should do. Keep
how external systems do it behind ports and infrastructure.
