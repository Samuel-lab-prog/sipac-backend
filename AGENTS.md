# AGENTS

Operational guide for working on the OlaPoesia backend. Read this before adding
features, fixing bugs, changing architecture, touching persistence, or editing
tests.

## Repository Boundary

- This directory is the backend repository.
- The frontend is a separate repository that happens to live near this one on
  the same machine. Do not create backend scripts that run frontend checks.
- Run backend commands from this directory: `C:\prog\olapoesia\backend`.

## Stack

- Runtime and test runner: Bun.
- Language: TypeScript, ESM, strict mode.
- HTTP framework: Elysia.
- ORM: Prisma 7 with `@prisma/adapter-pg`.
- Database: PostgreSQL.
- E2E runner: Playwright.
- Architecture tooling: dependency-cruiser, cloc, and
  `architecture-analysis/src/main.ts`.

## Environment

- Env loading is centralized in `src/server-config/utils/loadEnv.ts`.
- It loads `.env.${NODE_ENV}` first and falls back to `.env`.
- If `NODE_ENV` is absent, Bun tests infer `test`; otherwise the default is
  `development`.
- Existing env files are `.env.development`, `.env.test`, and `.env.production`.
- Prisma config imports `loadEnv`, so Prisma commands also depend on `NODE_ENV`.
- `DATABASE_URL` is required in every environment. Runtime and Prisma config
  reject mismatches such as `NODE_ENV=test` pointing to a dev/prod database or
  `NODE_ENV=development` pointing to a test/prod database.
- `bun run check:db-isolation` verifies `.env.development` and `.env.test` point
  to different database identities.
- Test database migrations are run through `bun run test:prepare`, which maps to
  `bun run db:migrate:test`.
- Do not assume an env file or DB target. Check the relevant script before
  running destructive database operations.

## Essential Commands

Setup and local development:

- `bun install`
- `bun run db:generate`
- `bun run db:migrate:dev`
- `bun run dev`
- `bun run build`
- `bun run start`
- `bun run start:dev`

Testing:

- `bun run test` runs test preparation plus the full Bun test suite.
- `bun run test:prepare` applies test DB migrations.
- `bun run test:run` runs all Bun tests with the JUnit reporter.
- `bun run test:unit` runs use-case and policy tests.
- `bun run test:use-case` runs tests tagged with `USE-CASE`.
- `bun run test:policy` runs tests tagged with `POLICY`.
- `bun run test:integration` prepares the test DB and runs integration tests.
- `bun run test:e2e` prepares the test DB and runs Playwright E2E tests with
  `NODE_ENV=test`.
- `bun run check:e2e` validates test env and runs backend E2E.

Quality checks:

- `bun run lint`
- `bun run lint:fix`
- `bun run format`
- `bun run format:fix`
- `bun run typecheck`
- `bun run depcruise`
- `bun run metrics`
- `bun run check:static`
- `bun run check`
- `bun run check:test`
- `bun run check:prod`
- `bun run check:all`

`bun run check:all` is the backend-only confidence gate. It validates test env,
runs static checks, builds, runs the full Bun test suite, and runs backend E2E.

Database and maintenance:

- `bun run db:migrate:dev`
- `bun run db:migrate:test`
- `bun run db:migrate:prod`
- `bun run db:seed`
- `bun run db:reset:dev`
- `bun run db:reset:test`
- `bun run db:reset:prod`
- `bun run db:drop:dev`
- `bun run db:drop:test`
- `bun run data:add-test`
- `bun run admin:create`
- `bun run admin:create:prod`

Compatibility aliases are intentionally kept:

- `generate`, `migratedev`, `migrateprod`, `seed`, `reset`, `resetprod`, `drop`,
  `add-test-data`, `create-admin`, and `create-adminprod`.

Docker:

- `bun run docker:build`
- `bun run docker:run`
- `bun run docker:up`
- `bun run compose`

## Project Shape

Top-level source layout:

- `src/Index.ts`: builds the Elysia app.
- `src/Server.ts`: loads env and starts the real server.
- `src/server-config/`: server, auth, CORS, rate limit, and env validation.
- `src/domains/`: business domains.
- `src/generic-subdomains/`: authentication, persistence, and generic utils.
- `src/shared-kernel/`: shared contracts, validators, policies, events, and
  infra helpers.
- `tests/integration/`: HTTP/integration tests.
- `tests/end2end/`: Playwright E2E tests.
- `architecture-analysis/`: architecture rules, docs, ADRs, and metrics tooling.

Current business domains:

- `feed-engine`
- `friends-management`
- `interactions`
- `moderation`
- `notifications`
- `poems-management`
- `users-management`

Current generic subdomains:

- `authentication`
- `persistance` (spelled this way in the codebase; keep the existing path)
- `utils`

## Architecture Rules

The backend is a domain-oriented modular monolith using CQRS and ports/adapters.

Mandatory dependency direction:

```text
adapters -> use-cases -> ports <- infra
```

Practical rules:

- Business logic belongs in use-cases or domain policies, not routers,
  repositories, framework plugins, or composition files.
- Use-cases depend on ports and domain policies only.
- Use-cases must not import Prisma, Elysia, adapters, routers, concrete infra,
  or framework-specific types.
- Infra implements ports and may use Prisma/external libraries.
- Infra must not import use-cases or adapters.
- `Composition.ts` may import use-cases and concrete infra to wire dependencies.
- Adapters should receive already-assembled services and expose routes.
- Cross-domain interaction must go through explicit `public` contracts such as
  `src/domains/<domain>/public/Index.ts`.
- Do not call another domain's infra or use-cases directly.
- Prefer small duplication over introducing hidden cross-domain coupling.
- Case-sensitive import paths matter. Match filesystem casing exactly.

Architecture is enforced. If dependency-cruiser or architecture metrics fail,
treat it as a design problem first, not only a tooling problem.

## Domain Folder Contract

Each domain generally follows:

```text
src/domains/<domain>/
  Composition.ts
  adapters/
    CommandsRouter.ts
    QueriesRouter.ts
  infra/
    commands-repository/
      repository.ts
      selects.ts
      helpers.ts
      helpers.test.ts
    queries-repository/
      repository.ts
      selects.ts
      helpers.ts
      helpers.test.ts
    <something>-service/
      execute.ts
  ports/
    commands.ts
    queries.ts
    models.ts
    externalServices.ts
    schemas/
      Index.ts
  public/
    Index.ts
  use-cases/
    commands/<use-case>/execute.ts
    commands/<use-case>/execute.test.ts
    queries/<use-case>/execute.ts
    queries/<use-case>/execute.test.ts
    policies/
    test-helpers/
```

Notes:

- Not every domain has every optional folder, but new code should follow the
  established local shape.
- `Composition.ts` is the composition root for a domain.
- `ports/schemas/Index.ts` is the barrel for Elysia schemas.
- Unit tests live next to the module they test.
- Integration tests live under `tests/integration/`.
- E2E tests live under `tests/end2end/`.

## Use-Case Rules

Use-cases are the center of application behavior.

When adding or changing a use-case:

- Put commands under `use-cases/commands/<action>/execute.ts`.
- Put queries under `use-cases/queries/<action>/execute.ts`.
- Export the params type from `execute.ts` when adapters/tests need it.
- Use a factory function that receives dependencies explicitly.
- Return application models from `ports/models.ts`.
- Throw domain/application errors instead of returning status objects.
- Keep validation of business invariants here or in domain policies.
- Do not catch dependency errors just to rethrow generic errors.
- Add or update `execute.test.ts`.

Typical shape:

```ts
interface Dependencies {
	queriesRepository: QueriesRepository;
	commandsRepository: CommandsRepository;
}

export type SomeUseCaseParams = {
	requesterId: number;
};

export function someUseCaseFactory(deps: Dependencies) {
	return async function someUseCase(params: SomeUseCaseParams) {
		// validate, query through ports, enforce policy, command through ports
	};
}
```

## Ports

Ports are application-owned contracts.

Rules:

- Query ports are read-only.
- Command ports mutate state.
- Models and DTOs belong in `ports/models.ts`.
- Elysia schemas belong in `ports/schemas/`.
- Ports must not import adapters, infra, Prisma, Elysia routers, or external
  implementation details.
- Infrastructure repositories must implement port interfaces exactly.

When a use-case needs data, add the method to the relevant port first, then
implement it in infra, then wire it in `Composition.ts`.

## Adapters and Routers

Routers live in `adapters/CommandsRouter.ts` and `adapters/QueriesRouter.ts`.

Adapters should:

- define routes and Elysia schemas,
- extract params/body/query/auth,
- call already-wired services,
- declare response schemas and OpenAPI details,
- map validation through shared schema helpers.

Adapters should not:

- contain business rules,
- query Prisma directly,
- coordinate multiple use-cases for business reasons,
- duplicate use-case authorization logic.

Use `authPlugin` when a route requires authentication. Public routes should be
intentional.

## Composition and Dependency Injection

`Composition.ts` wires concrete infra to use-case factories and exports routers.

Rules:

- Composition can import infra and use-cases.
- Composition should contain assembly only.
- Do not put validation, authorization, filtering, or persistence logic in
  composition files.
- If logic is needed, move it to a use-case, policy, mapper, or infra helper.

## Infrastructure and Prisma

Prisma access belongs in infra or generic persistence helpers only.

Important files:

- Prisma schema: `src/generic-subdomains/persistance/prisma/schema.prisma`
- Prisma client wrapper:
  `src/generic-subdomains/persistance/prisma/PrismaClient.ts`
- Prisma migrations: `src/generic-subdomains/persistance/prisma/migrations/`
- Prisma config: `prisma.config.ts`
- Database cleaner: `src/generic-subdomains/persistance/prisma/ClearDatabase.ts`

Rules:

- Do not import Prisma in use-cases or adapters.
- Keep select projections in `selects.ts`.
- Keep mapping helpers in `helpers.ts`.
- Mapping must convert DB shapes to application models explicitly.
- Do not return raw Prisma rows from repositories.
- Wrap/normalize persistence errors through existing Prisma error helpers when
  applicable.
- When adding tables, update `ClearDatabase.ts` so integration tests and local
  cleanup really truncate application data. Do not truncate
  `_prisma_migrations`.
- `ClearDatabase.ts` intentionally retries transient PostgreSQL deadlocks.

## Authorization, Visibility, and Moderation

Be careful with user status semantics:

- `active`: normal access.
- `suspended`: not the same as banned; some flows still allow access.
- `banned`: hard block in auth and most user-facing visibility.

Important helpers:

- `src/shared-kernel/policies/BannedUserVisibility.ts`
- `src/generic-subdomains/persistance/prisma/VisibilityFilters.ts`
- Domain policies such as
  `src/domains/poems-management/use-cases/policies/Policies.ts`

Known expectations:

- `login`, `authenticate`, and `refresh` reject banned users.
- Regular viewers should not see banned public profiles/content unless the
  business rule explicitly allows it.
- Active moderators/admins may view some banned-user history where the policy
  allows it.
- For poems, visibility depends on author, viewer, friendship, status,
  moderation status, and direct access. Reuse existing policy helpers.
- Do not fix a visibility bug only in the frontend. Backend queries and mappers
  must not leak data that should be unavailable.

When touching visibility, search for all affected code paths:

- use-case policy,
- query repository filters,
- mapper helpers,
- integration tests,
- frontend contract expectations if API shape changes.

## Errors

Central error modules:

- `@GenericSubdomains/utils/domainError`
- `@AppError;`
- `@DatabaseError`

Use-case errors usually come from `domainError`:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`
- `UnprocessableEntityError`
- `UnknownError`

Adapters and plugins translate errors to HTTP `AppError` responses.

Rules:

- Throw explicit errors with useful messages.
- Do not leak Prisma/native errors through the public API.
- Validation errors at route/schema boundaries should use `makeValidationError`
  or `makeBadRequestError`.
- Keep API error codes stable when frontend behavior depends on them.

## Schemas, Validation, and Types

- Shared schemas live in `src/shared-kernel/Schemas.ts`.
- Shared enums/types live in `src/shared-kernel/Enums.ts` and `Types.ts`.
- Domain schemas live in `src/domains/<domain>/ports/schemas/`.
- TypeScript path aliases are defined in `tsconfig.json`; prefer existing
  aliases over long relative imports when that is the local pattern.
- Do not introduce duplicate enum string unions if a shared type already exists.
- In production, URL schemas may require HTTPS; in test/development they allow
  HTTP where configured.

## Events and Side Effects

- Shared event bus lives in `src/shared-kernel/events/`.
- Notification listeners are registered by importing
  `@Domains/notifications/EventListeners.ts` in `src/Index.ts`.
- Side effects should be explicit and testable.
- Do not hide important side effects inside mappers or low-level helpers.

## Testing Strategy

Use Bun's test runner for backend unit/integration tests.

General rules:

- Every use-case needs a colocated `execute.test.ts`.
- Use-case tests should mock/fake ports and call the use-case directly.
- Policy tests live next to policies.
- Infra tests are encouraged for mappers, filters, query behavior, and tricky
  persistence cases.
- Integration tests validate multi-layer HTTP/DB behavior and use
  `clearDatabase()`.
- E2E tests live under `tests/end2end/` and start the server in `NODE_ENV=test`.
- Keep tests deterministic and isolated.

Useful helpers and examples:

- `src/generic-subdomains/utils/TestUtils.ts`
- Domain `use-cases/test-helpers/` folders.
- `tests/integration/TestsSetups.ts`
- `tests/integration/endpoints/`
- `tests/integration/poems-management/PoemVisibility.test.ts`
- `tests/end2end/helpers/server.ts`

Test naming conventions:

- Use-case tests usually include `USE-CASE - <Domain> - <Action>`.
- Policy tests usually include `POLICY`.
- Integration tests usually include `INTEGRATION`.
- Performance-oriented tests may include `PERFORMANCE`.

Before considering backend work complete, run the narrowest meaningful test
first, then a broader command based on risk:

- small use-case change: focused `bun test <path>` or `bun run test:unit`;
- repository/DB change: focused test plus `bun run test:integration`;
- auth/cookie/server change: `bun run test:e2e`;
- broad/shared change: `bun run check:all`.

## E2E Notes

- `bun run test:e2e` now runs `test:prepare` and starts Playwright with
  `NODE_ENV=test`.
- The E2E server helper also forces the child server process to `NODE_ENV=test`.
- E2E currently uses a real server process and Playwright browser context.
- Clean up storage state files if a test creates new persisted artifacts.

## Linting, Formatting, and Build

- ESLint warns on `require-await`; avoid `async` functions with no `await`.
- Tests disable some size/complexity rules, but still prefer readable fixtures.
- `format:fix` may rewrite files. Check the diff after running broad checks.
- `typecheck` is `tsc --noEmit`.
- `build` outputs to `dist/`.
- `check:static` runs barrels, lint fix, format fix, metrics, depcruise, and
  typecheck.

## Generated and Tooling Files

The following files are generated or tool outputs:

- `dist/`
- `bun.xml`
- `cloc.json`
- `depcruise.json`
- `.eslintcache`
- `test-results/`
- `.e2e-storage.json`

Do not hand-edit generated artifacts unless the task explicitly requires it.
After running broad checks, inspect whether generated files changed.

## Adding a Feature

Use this path unless the existing domain clearly does something different:

1. Identify the owning domain.
2. Add or update port models/schemas/contracts.
3. Add or update the use-case under `commands/` or `queries/`.
4. Add or update use-case tests.
5. Implement or update infra repository methods.
6. Add mapper/select helpers if DB shape changes.
7. Wire the use-case in `Composition.ts`.
8. Expose the route in the appropriate adapter.
9. Add integration/E2E coverage if the behavior crosses HTTP, cookies, DB, or
   auth boundaries.
10. Run focused tests, then the appropriate broader check.

## Fixing a Bug

Prefer this investigation order:

1. Reproduce or locate the failing behavior.
2. Identify the true owner of the rule: route, use-case, policy, port, infra, or
   mapper.
3. Fix the owner, not only the symptom.
4. Add a regression test at the same layer as the rule.
5. If the bug involves stale data leaking, check both repository filters and
   mapper output.
6. Run the focused test and a broader command matching the blast radius.

## Database Changes

When changing schema:

1. Edit `schema.prisma`.
2. Create a migration with the appropriate Prisma command.
3. Regenerate Prisma client if needed.
4. Update ports/models/schemas and mappers.
5. Update `ClearDatabase.ts` for new application tables or join tables.
6. Add/adjust repository and integration tests.
7. Run `bun run db:migrate:test`, then relevant tests.

Be extra careful with destructive scripts:

- `db:reset:dev`
- `db:reset:test`
- `db:reset:prod`
- `db:drop:dev`
- `db:drop:test`

Confirm the target environment and database before running them.

## Admin and Seed Data

- `bun run admin:create` is env-driven in non-interactive contexts.
- Required env vars for admin creation include `ADMIN_EMAIL` and
  `ADMIN_PASSWORD`.
- Optional admin vars include `ADMIN_NAME`, `ADMIN_NICKNAME`, `ADMIN_BIO`, and
  `ADMIN_AVATAR_URL`.
- If the admin email already exists, the script updates that user to admin and
  refreshes the password hash.
- `bun run data:add-test` seeds larger local/test-like data.

## API and Public Contracts

- Routes are under `/api/v1`.
- OpenAPI docs are served at `/docs` for the real server.
- Keep response schemas in sync with returned objects.
- If API shape changes, update schemas, ports, adapters, and any integration
  tests that exercise the contract.
- Public cross-domain contracts live under `src/domains/<domain>/public/`.
- Do not expose internal repository shapes through public contracts.

## Imports and Aliases

Use existing aliases from `tsconfig.json` when appropriate:

- `@Domains/*`
- `@GenericSubdomains/*`
- `@SharedKernel/*`
- `@Prisma/*`
- `@PrismaClient`
- `@ClearDatabase`
- `@AppError`
- `@DomainError`
- `@DatabaseError`
- `@authPlugin`
- `tests/*`

Relative imports are fine inside a tightly scoped folder when that is the local
pattern. Preserve nearby style.

## Documentation Sources

Read these before changing architecture:

- `README.md`
- `architecture-analysis/docs/001-architecture.md`
- `architecture-analysis/docs/002-use-cases.md`
- `architecture-analysis/docs/003-ports.md`
- `architecture-analysis/docs/004-adapters.md`
- `architecture-analysis/docs/005-infra.md`
- `architecture-analysis/docs/006-injection.md`
- `architecture-analysis/docs/007-tests.md`
- `architecture-analysis/adrs/README.md`

If an architecture rule must change, update the relevant ADR/tooling instead of
silencing the failure locally.

## Local Caveats

- Some sandboxed tool runs may fail to resolve Bun scripts. If `bun run ...`
  reports a script is missing even though `package.json` contains it, rerun from
  `C:\prog\olapoesia\backend` in the normal local environment.
- The repo has both `package-lock.json` and `bun.lock`; runtime scripts use Bun.
- Keep user-facing API messages in English unless a task explicitly requests
  otherwise.
- Do not revert unrelated local changes. Check `git status --short` before and
  after broad commands.
