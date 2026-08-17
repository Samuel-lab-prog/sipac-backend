import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	path: string;
	root: string;
	reason: string;
};

const ALLOWED_BOOTSTRAP_FILES = new Set([
	'src/Index.ts',
	'src/Server.ts',
	'src/config.ts',
]);

const ALLOWED_ROOT_NAMESPACES = new Set([
	'domains',
	'generic-subdomains',
	'server-config',
	'shared-kernel',
]);

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

function isSourceFile(path: string): boolean {
	return /\.(ts|tsx|js|jsx)$/.test(path);
}

function isDomainNamespace(path: string): boolean {
	return /^src\/(domains|generic-subdomains)\/[^/]+\/.+/.test(path);
}

export function checkDomainDrivenStructure(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		if (!path.startsWith('src/')) continue;
		if (!isSourceFile(path)) continue;

		const parts = path.split('/');
		const root = parts[1] ?? '';

		if (ALLOWED_BOOTSTRAP_FILES.has(path)) continue;

		if (!root) {
			violations.push({
				path,
				root: '(missing)',
				reason: 'Source file has no architectural namespace',
			});
			continue;
		}

		if (!ALLOWED_ROOT_NAMESPACES.has(root)) {
			violations.push({
				path,
				root,
				reason: 'Unknown architectural namespace',
			});
			continue;
		}

		if (
			(root === 'domains' || root === 'generic-subdomains') &&
			!isDomainNamespace(path)
		) {
			violations.push({
				path,
				root,
				reason: 'Domain namespace must include a subdomain name',
			});
		}
	}

	return violations;
}

export function printDomainDrivenStructure(cloc: ClocResult): void {
	const violations = checkDomainDrivenStructure(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All source files follow the domain-driven structure',
				ADR.domainStructure,
			),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'ROOT',
			width: 24,
			render: (v) => ({
				text: v.root,
				color: yellow,
			}),
		},
		{
			header: 'PATH',
			width: 70,
			render: (v) => ({
				text: v.path,
				color: red,
			}),
		},
		{
			header: 'REASON',
			width: 48,
			render: (v) => ({
				text: v.reason,
				color: yellow,
			}),
		},
	];

	printTable(
		withAdr(
			`Domain-driven structure violations (${violations.length})`,
			ADR.domainStructure,
		),
		columns,
		violations,
	);
}
