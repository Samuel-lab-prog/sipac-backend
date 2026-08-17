import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	domain: string;
	path: string;
	missingFolders: string[];
};

const REQUIRED_FOLDERS = ['use-cases', 'ports', 'adapters'];

const DOMAIN_REGEX = /^src\/domains\/([^/]+)(?:\/(.+))?/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkMissingDirectories(cloc: ClocResult): Violation[] {
	const domains = new Map<
		string,
		{
			domain: string;
			path: string;
			folders: Set<string>;
		}
	>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(DOMAIN_REGEX);
		if (!match) continue;

		const [, domainName, rest] = match;
		if (!domainName) continue;
		const domainPath = `src/domains/${domainName}`;
		const firstFolder = rest?.split('/')[0];

		const entry = domains.get(domainPath) ?? {
			domain: domainName,
			path: domainPath,
			folders: new Set<string>(),
		};

		if (firstFolder) entry.folders.add(firstFolder);
		domains.set(domainPath, entry);
	}

	const violations: Violation[] = [];

	for (const domain of domains.values()) {
		const missing = REQUIRED_FOLDERS.filter((f) => !domain.folders.has(f));

		if (missing.length > 0) {
			violations.push({
				domain: domain.domain,
				path: domain.path,
				missingFolders: missing,
			});
		}
	}

	return violations.sort((a, b) => a.path.localeCompare(b.path));
}

export function printNoMissingDirectories(cloc: ClocResult): void {
	const violations = checkMissingDirectories(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All domains follow ports & adapters structure',
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
			header: 'DOMAIN PATH',
			width: 55,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'MISSING FOLDERS',
			width: 35,
			render: (v) => ({
				text: v.missingFolders.join(', '),
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
			`Ports & Adapters violations (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
