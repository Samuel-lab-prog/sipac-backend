# HelloPoetry Backend

Backend for the **HelloPoetry** poetry social network. This repository
implements the API and business rules using a domain-oriented modular monolith,
CQRS, and ports/adapters.

This is the backend repository only. The frontend is a separate repository that
may live beside this one on the same machine, but backend scripts should not run
frontend checks.

Main technologies:

- **TypeScript**
- **Bun** for runtime and tests
- **Elysia** for HTTP
- **Prisma** with PostgreSQL
- **Playwright** for backend E2E tests

For implementation conventions, architecture rules, scripts, testing strategy,
and local caveats, read [AGENTS.md](AGENTS.md).

---

## Architecture in 1 Minute

- **Domain-oriented modular monolith**: each domain owns its behavior and
  contracts.
- **CQRS**: write flows live under commands; read flows live under queries.
- **Ports & adapters**: use-cases depend on app-owned ports; infra implements
  those ports.
- **Dependency injection**: composition happens at the edge, mostly in domain
  `Composition.ts` files.
- **Architecture rules are enforced**: dependency direction, domain isolation,
  tests, formatting, linting, build, and metrics are part of the quality gate.

Mandatory dependency direction:

```text
adapters -> use-cases -> ports <- infra
```

---

## Architecture Documentation

Practical guides:

- [Architecture overview](architecture-analysis/docs/001-architecture.md)
- [Use-cases](architecture-analysis/docs/002-use-cases.md)
- [Ports](architecture-analysis/docs/003-ports.md)
- [Adapters](architecture-analysis/docs/004-adapters.md)
- [Infra](architecture-analysis/docs/005-infra.md)
- [Dependency injection](architecture-analysis/docs/006-injection.md)
- [Tests](architecture-analysis/docs/007-tests.md)

ADRs:

- [ADR index](architecture-analysis/adrs/README.md)

---

## Project Structure

```text
src/
  Index.ts                 # Builds the Elysia app
  Server.ts                # Loads env and starts the real server
  server-config/           # Server, auth, CORS, rate limit, env config
  domains/                 # Business domains
  generic-subdomains/      # Auth, persistence, generic utils
  shared-kernel/           # Shared contracts, validators, policies, events
tests/
  integration/             # Integration tests
  end2end/                 # Playwright E2E tests
architecture-analysis/     # Architecture docs, ADRs, rules, metrics
```

Each domain generally contains:

- `adapters/`
- `infra/`
- `ports/`
- `public/`
- `use-cases/`
- `Composition.ts`

---

## Environment

Environment files are loaded by `src/server-config/utils/loadEnv.ts`.

Resolution order:

1. `.env.${NODE_ENV}`
2. `.env`

Existing local files:

- `.env.development`
- `.env.test`
- `.env.production`

Prisma also loads this environment through `prisma.config.ts`, so set `NODE_ENV`
intentionally when running database commands. Test scripts already do this for
you.

`DATABASE_URL` is required in every environment. Development must point to a
database/schema containing `dev` or `development`; tests must point to a
database/schema containing `test`. The env checks also verify that
`.env.development` and `.env.test` do not point to the same database.

---

## Running Locally

Prerequisites:

- Bun
- Node.js for Prisma CLI
- PostgreSQL

Install dependencies:

```bash
bun install
```

Generate Prisma client:

```bash
bun run db:generate
```

Apply development migrations:

```bash
bun run db:migrate:dev
```

Start the dev server:

```bash
bun run dev
```

Build:

```bash
bun run build
```

Run built server:

```bash
bun run start
```

---

## Tests

Full Bun test suite with test DB migration preparation:

```bash
bun run test
```

Run only use-case and policy tests:

```bash
bun run test:unit
```

Run integration tests:

```bash
bun run test:integration
```

Run backend E2E tests:

```bash
bun run test:e2e
```

`test:e2e` applies test DB migrations and runs Playwright with `NODE_ENV=test`.

---

## Quality Gates

Useful focused checks:

```bash
bun run lint
bun run format
bun run typecheck
bun run metrics
bun run depcruise
```

Static backend gate:

```bash
bun run check:static
```

Normal local backend gate:

```bash
bun run check
```

Backend-only full confidence gate:

```bash
bun run check:all
```

`check:all` validates the test environment, runs static checks, builds, runs the
full Bun test suite, and runs backend E2E.

---

## Database and Maintenance Scripts

Preferred database scripts:

```bash
bun run db:generate
bun run db:migrate:dev
bun run db:migrate:test
bun run db:migrate:prod
bun run db:seed
bun run db:reset:dev
bun run db:reset:test
bun run db:reset:prod
bun run db:drop:dev
bun run db:drop:test
```

The curated local seed uses `password123` for all seeded users.

Admin and data helpers:

```bash
bun run admin:create
bun run admin:create:prod
bun run data:add-test
```

Compatibility aliases are still available for older habits and docs:

- `generate`
- `migratedev`
- `migrateprod`
- `seed`
- `reset`
- `resetprod`
- `drop`
- `add-test-data`
- `create-admin`
- `create-adminprod`

Be careful with reset/drop commands. Dev and test destructive scripts set
`NODE_ENV` explicitly, and startup/Prisma config validates the database name
against the environment before connecting.

---

## Architecture Analysis Tool

The backend includes an internal architecture analysis tool in
`architecture-analysis/`. It validates structural rules, detects erosion
signals, and is part of the local/CI gate.

Run only the architecture analyzer:

```bash
bun run metrics:analysis
```

Run the full metrics pipeline:

```bash
bun run metrics
```

Generated artifacts:

- `cloc.json`
- `depcruise.json`
- console report from `architecture-analysis/src/main.ts`

If an architecture rule fails, treat it as a design issue first. Fix the drift
or update the ADR/rule with clear rationale.

---

## Docker

Build:

```bash
bun run docker:build
```

Run:

```bash
bun run docker:run
```

Build and run:

```bash
bun run docker:up
```

Compose:

```bash
bun run compose
```

---

## Commit Conventions

Use Conventional Commits:

- `feat:` new feature
- `fix:` bug fix
- `refactor:` refactor without behavior change
- `docs:` documentation
- `style:` formatting
- `test:` tests
- `chore:` maintenance

Example:

```text
fix: handle expired token login
```

---

## Contributing

Before opening a PR or considering a broad backend change complete, run:

```bash
bun run check:all
```

For smaller changes, start with the narrowest meaningful test, then broaden
based on the blast radius. See [AGENTS.md](AGENTS.md) for the detailed workflow.
