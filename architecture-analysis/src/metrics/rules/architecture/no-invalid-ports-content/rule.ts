import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	domain: string;
	path: string;
	entry: string;
	reason: string;
};

const ALLOWED_FILES = new Set([
	'models.ts',
	'commands.ts',
	'queries.ts',
	'externalServices.ts',
]);

const PORTS_REGEX = /^src\/(domains|generic-subdomains)\/([^/]+)\/ports\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkInvalidPortsContent(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(PORTS_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, rest] = match;
		if (!rootNamespace || !domainName || !rest) continue;

		const parts = rest.split('/');
		const domainPath = `src/${rootNamespace}/${domainName}/ports`;

		if (parts.length === 1) {
			const entry = parts[0]!;
			if (ALLOWED_FILES.has(entry)) continue;

			const key = `${domainPath}|${entry}|file`;
			if (seen.has(key)) continue;
			seen.add(key);
			violations.push({
				domain: domainName,
				path: domainPath,
				entry,
				reason: 'Invalid file name',
			});
			continue;
		}

		const folder = parts[0]!;
		if (folder === 'schemas') continue;

		const key = `${domainPath}|${folder}|folder`;
		if (seen.has(key)) continue;
		seen.add(key);
		violations.push({
			domain: domainName,
			path: `${domainPath}/${folder}`,
			entry: folder,
			reason: 'Invalid ports folder',
		});
	}

	return violations;
}

export function printNoInvalidPortsContent(cloc: ClocResult): void {
	const violations = checkInvalidPortsContent(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All ports folders follow file rules',
				ADR.mandatoryDomainFolders,
			),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'DOMAIN',
			width: 25,
			render: (v) => ({
				text: v.domain,
				color: red,
			}),
		},
		{
			header: 'PORTS PATH',
			width: 55,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'ENTRY',
			width: 26,
			render: (v) => ({
				text: v.entry,
				color: yellow,
			}),
		},
		{
			header: 'REASON',
			width: 30,
			render: (v) => ({
				text: v.reason,
				color: yellow,
			}),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({
				text: 'VIOLATION',
				color: red,
			}),
		},
	];

	printTable(
		withAdr(
			`Ports file violations (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
