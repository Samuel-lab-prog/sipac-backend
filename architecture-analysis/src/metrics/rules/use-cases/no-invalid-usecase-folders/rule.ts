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

const ALLOWED_USE_CASE_FOLDERS = new Set([
	'commands',
	'queries',
	'policies',
	'test-helpers',
]);

const USE_CASES_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/use-cases\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkInvalidUseCaseFolders(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(USE_CASES_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, rest] = match;
		if (!rootNamespace || !domainName || !rest) continue;

		const parts = rest.split('/');
		const domainPath = `src/${rootNamespace}/${domainName}/use-cases`;

		if (parts.length === 1) {
			const entry = parts[0]!;
			const key = `${domainPath}|${entry}|file`;
			if (seen.has(key)) continue;
			seen.add(key);
			violations.push({
				domain: domainName,
				path: domainPath,
				entry,
				reason: 'Files are not allowed at use-cases root',
			});
			continue;
		}

		const folder = parts[0]!;
		if (ALLOWED_USE_CASE_FOLDERS.has(folder)) continue;

		const key = `${domainPath}|${folder}|folder`;
		if (seen.has(key)) continue;
		seen.add(key);
		violations.push({
			domain: domainName,
			path: `${domainPath}/${folder}`,
			entry: folder,
			reason: 'Invalid use-cases folder',
		});
	}

	return violations;
}

export function printNoInvalidUseCaseFolders(cloc: ClocResult): void {
	const violations = checkInvalidUseCaseFolders(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All use-cases folders are valid',
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
			header: 'USE-CASES PATH',
			width: 55,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'ENTRY',
			width: 30,
			render: (v) => ({
				text: v.entry,
				color: yellow,
			}),
		},
		{
			header: 'REASON',
			width: 32,
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
			`Use-cases folder violations (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
