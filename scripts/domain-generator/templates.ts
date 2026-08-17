export type DomainTemplateInput = {
	domainSlug: string;
	domainPascal: string;
	routePrefix: string;
};

function p(input: DomainTemplateInput) {
	return input.domainPascal;
}

function s(input: DomainTemplateInput) {
	return input.domainSlug;
}

function r(input: DomainTemplateInput) {
	return input.routePrefix;
}

export function compositionTemplate(input: DomainTemplateInput) {
	return `import { create${p(input)}CommandsRouter } from './adapters/CommandsRouter';
import { create${p(input)}QueriesRouter } from './adapters/QueriesRouter';
import type { CommandsRouterServices } from './ports/commands';
import type { QueriesRouterServices } from './ports/queries';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { create${p(input)}Factory } from './use-cases/commands/Index';
import { get${p(input)}HealthFactory } from './use-cases/queries/Index';

const commandsRouterServices: CommandsRouterServices = {
\tcreate${p(input)}: create${p(input)}Factory({
\t\tcommandsRepository,
\t}),
};

const queriesRouterServices: QueriesRouterServices = {
\tget${p(input)}Health: get${p(input)}HealthFactory({
\t\tqueriesRepository,
\t}),
};

export const ${s(input)}CommandsRouter = create${p(input)}CommandsRouter(
\tcommandsRouterServices,
);

export const ${s(input)}QueriesRouter = create${p(input)}QueriesRouter(
\tqueriesRouterServices,
);
`;
}

export function commandsRouterTemplate(input: DomainTemplateInput) {
	return `import { Elysia } from 'elysia';
import { appErrorSchema } from '@AppError';
import { ${p(input)}CreatedSchema } from '../ports/schemas/Index';
import type { CommandsRouterServices } from '../ports/commands';

export function create${p(input)}CommandsRouter(services: CommandsRouterServices) {
\treturn new Elysia({ prefix: '/${r(input)}' }).post(
\t\t'/',
\t\t() => services.create${p(input)}(),
\t\t{
\t\t\tresponse: {
\t\t\t\t201: ${p(input)}CreatedSchema,
\t\t\t\t500: appErrorSchema,
\t\t\t},
\t\t\tstatus: 201,
\t\t},
\t);
}
`;
}

export function queriesRouterTemplate(input: DomainTemplateInput) {
	return `import { Elysia } from 'elysia';
import { appErrorSchema } from '@AppError';
import { ${p(input)}HealthSchema } from '../ports/schemas/Index';
import type { QueriesRouterServices } from '../ports/queries';

export function create${p(input)}QueriesRouter(services: QueriesRouterServices) {
\treturn new Elysia({ prefix: '/${r(input)}' }).get(
\t\t'/health',
\t\t() => services.get${p(input)}Health(),
\t\t{
\t\t\tresponse: {
\t\t\t\t200: ${p(input)}HealthSchema,
\t\t\t\t500: appErrorSchema,
\t\t\t},
\t\t\tstatus: 200,
\t\t},
\t);
}
`;
}

export function modelsTemplate(input: DomainTemplateInput) {
	return `export type ${p(input)}Created = {
\tid: number;
\tmessage: string;
};

export type ${p(input)}Health = {
\tstatus: 'ok';
\tdomain: '${s(input)}';
};
`;
}

export function commandsPortsTemplate(input: DomainTemplateInput) {
	return `import type { ${p(input)}Created } from './models';

export interface CommandsRepository {
\tcreate(): Promise<${p(input)}Created>;
}

export interface CommandsRouterServices {
\tcreate${p(input)}(): Promise<${p(input)}Created>;
}
`;
}

export function queriesPortsTemplate(input: DomainTemplateInput) {
	return `import type { ${p(input)}Health } from './models';

export interface QueriesRepository {
\tgetHealth(): Promise<${p(input)}Health>;
}

export interface QueriesRouterServices {
\tget${p(input)}Health(): Promise<${p(input)}Health>;
}
`;
}

export function schemasTemplate(input: DomainTemplateInput) {
	return `import { t } from 'elysia';

export const ${p(input)}CreatedSchema = t.Object({
\tid: t.Number({ minimum: 1 }),
\tmessage: t.String(),
});

export const ${p(input)}HealthSchema = t.Object({
\tstatus: t.Literal('ok'),
\tdomain: t.Literal('${s(input)}'),
});
`;
}

export function commandUseCaseTemplate(input: DomainTemplateInput) {
	return `import type { CommandsRepository } from '../../../ports/commands';
import type { ${p(input)}Created } from '../../../ports/models';

type Params = {
\tcommandsRepository: CommandsRepository;
};

export function create${p(input)}Factory(params: Params) {
\treturn async function create${p(input)}(): Promise<${p(input)}Created> {
\t\treturn params.commandsRepository.create();
\t};
}
`;
}

export function commandIndexTemplate(input: DomainTemplateInput) {
	return `export { create${p(input)}Factory } from './create/execute';
`;
}

export function queryUseCaseTemplate(input: DomainTemplateInput) {
	return `import type { QueriesRepository } from '../../../ports/queries';
import type { ${p(input)}Health } from '../../../ports/models';

type Params = {
\tqueriesRepository: QueriesRepository;
};

export function get${p(input)}HealthFactory(params: Params) {
\treturn async function get${p(input)}Health(): Promise<${p(input)}Health> {
\t\treturn params.queriesRepository.getHealth();
\t};
}
`;
}

export function queryIndexTemplate(input: DomainTemplateInput) {
	return `export { get${p(input)}HealthFactory } from './get-health/execute';
`;
}

export function commandsRepositoryTemplate(input: DomainTemplateInput) {
	return `import type { CommandsRepository } from '../../ports/commands';

export const commandsRepository: CommandsRepository = {
\tasync create() {
\t\treturn {
\t\t\tid: Date.now(),
\t\t\tmessage: '${p(input)} created',
\t\t};
\t},
};
`;
}

export function queriesRepositoryTemplate(input: DomainTemplateInput) {
	return `import type { QueriesRepository } from '../../ports/queries';

export const queriesRepository: QueriesRepository = {
\tasync getHealth() {
\t\treturn {
\t\t\tstatus: 'ok' as const,
\t\t\tdomain: '${s(input)}' as const,
\t\t};
\t},
};
`;
}
