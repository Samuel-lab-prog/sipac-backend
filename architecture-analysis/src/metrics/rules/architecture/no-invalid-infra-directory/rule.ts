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

const ALLOWED_INFRA_FOLDERS = new Set([
	'commands-repository',
	'queries-repository',
]);

const DOMAIN_INFRA_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/infra\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

function isAllowedInfraFolder(folder: string): boolean {
	if (ALLOWED_INFRA_FOLDERS.has(folder)) return true;
	return folder.endsWith('-service');
}

export function checkInvalidInfraDirectory(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(DOMAIN_INFRA_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, rest] = match;
		if (!rootNamespace || !domainName || !rest) continue;

		const parts = rest.split('/');
		const domainPath = `src/${rootNamespace}/${domainName}/infra`;

		if (parts.length === 1) {
			const entry = parts[0]!;
			const key = `${domainPath}|${entry}|file`;
			if (seen.has(key)) continue;
			seen.add(key);
			violations.push({
				domain: domainName,
				path: domainPath,
				entry,
				reason: 'Files are not allowed at infra root',
			});
			continue;
		}

		const folder = parts[0]!;
		if (isAllowedInfraFolder(folder)) continue;

		const key = `${domainPath}|${folder}|folder`;
		if (seen.has(key)) continue;
		seen.add(key);
		violations.push({
			domain: domainName,
			path: `${domainPath}/${folder}`,
			entry: folder,
			reason: 'Invalid infra folder',
		});
	}

	return violations;
}

export function printNoInvalidInfraDirectory(cloc: ClocResult): void {
	const violations = checkInvalidInfraDirectory(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All infra folders are valid',
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
			header: 'INFRA PATH',
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
			`Infra structure violations (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
