import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join } from 'node:path';
import {
	commandIndexTemplate,
	commandUseCaseTemplate,
	commandsPortsTemplate,
	commandsRepositoryTemplate,
	commandsRouterTemplate,
	compositionTemplate,
	modelsTemplate,
	queriesPortsTemplate,
	queriesRepositoryTemplate,
	queriesRouterTemplate,
	queryIndexTemplate,
	queryUseCaseTemplate,
	schemasTemplate,
	type DomainTemplateInput,
} from './templates';

export type CreateDomainOptions = {
	domainName: string;
	force?: boolean;
	dryRun?: boolean;
	projectRoot?: string;
};

function toKebabCase(value: string): string {
	return value
		.trim()
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[_\s]+/g, '-')
		.replace(/-+/g, '-')
		.toLowerCase();
}

function toPascalCase(value: string): string {
	return value
		.split('-')
		.filter(Boolean)
		.map((part) => part[0]!.toUpperCase() + part.slice(1))
		.join('');
}

function assertDomainName(domainSlug: string) {
	const isValid = /^[a-z][a-z0-9-]*$/.test(domainSlug);
	if (!isValid) {
		throw new Error(
			`Invalid domain name "${domainSlug}". Use letters, numbers and hyphens, starting with a letter.`,
		);
	}
}

async function exists(path: string) {
	try {
		await access(path, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

type FileSpec = {
	relativePath: string;
	content: string;
};

function buildFiles(input: DomainTemplateInput): FileSpec[] {
	return [
		{
			relativePath: 'Composition.ts',
			content: compositionTemplate(input),
		},
		{
			relativePath: 'adapters/CommandsRouter.ts',
			content: commandsRouterTemplate(input),
		},
		{
			relativePath: 'adapters/QueriesRouter.ts',
			content: queriesRouterTemplate(input),
		},
		{
			relativePath: 'ports/models.ts',
			content: modelsTemplate(input),
		},
		{
			relativePath: 'ports/commands.ts',
			content: commandsPortsTemplate(input),
		},
		{
			relativePath: 'ports/queries.ts',
			content: queriesPortsTemplate(input),
		},
		{
			relativePath: 'ports/schemas/Index.ts',
			content: schemasTemplate(input),
		},
		{
			relativePath: 'use-cases/commands/create/execute.ts',
			content: commandUseCaseTemplate(input),
		},
		{
			relativePath: 'use-cases/commands/Index.ts',
			content: commandIndexTemplate(input),
		},
		{
			relativePath: 'use-cases/queries/get-health/execute.ts',
			content: queryUseCaseTemplate(input),
		},
		{
			relativePath: 'use-cases/queries/Index.ts',
			content: queryIndexTemplate(input),
		},
		{
			relativePath: 'infra/commands-repository/repository.ts',
			content: commandsRepositoryTemplate(input),
		},
		{
			relativePath: 'infra/queries-repository/repository.ts',
			content: queriesRepositoryTemplate(input),
		},
	];
}

export async function createDomain(options: CreateDomainOptions) {
	const domainSlug = toKebabCase(options.domainName);
	assertDomainName(domainSlug);

	const domainPascal = toPascalCase(domainSlug);
	const routePrefix = domainSlug;
	const projectRoot = options.projectRoot ?? process.cwd();
	const domainRoot = join(projectRoot, 'src', 'domains', domainSlug);
	const input: DomainTemplateInput = { domainSlug, domainPascal, routePrefix };

	const alreadyExists = await exists(domainRoot);
	if (alreadyExists && !options.force) {
		throw new Error(
			`Domain "${domainSlug}" already exists at ${domainRoot}. Use --force to overwrite files.`,
		);
	}

	const files = buildFiles(input);
	const createdFiles: string[] = [];

	for (const file of files) {
		const fullPath = join(domainRoot, file.relativePath);
		if (options.dryRun) {
			createdFiles.push(fullPath);
			continue;
		}

		await mkdir(dirname(fullPath), { recursive: true });
		await writeFile(fullPath, file.content, 'utf8');
		createdFiles.push(fullPath);
	}

	return {
		domainSlug,
		domainPascal,
		domainRoot,
		createdFiles,
		dryRun: !!options.dryRun,
	};
}
