import { red } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	domain: string;
	path: string;
	missing: string;
};

const SCHEMA_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/ports\/schemas\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkMissingSchemaBarrels(cloc: ClocResult): Violation[] {
	const folders = new Map<
		string,
		{ domain: string; path: string; hasIndex: boolean }
	>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(SCHEMA_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, rest] = match;
		if (!rootNamespace || !domainName || !rest) continue;

		const folderPath = `src/${rootNamespace}/${domainName}/ports/schemas`;
		const entry = folders.get(folderPath) ?? {
			domain: domainName,
			path: folderPath,
			hasIndex: false,
		};

		if (rest.toLowerCase() === 'index.ts') entry.hasIndex = true;

		folders.set(folderPath, entry);
	}

	const violations: Violation[] = [];

	for (const folder of folders.values()) {
		if (folder.hasIndex) continue;
		violations.push({
			domain: folder.domain,
			path: folder.path,
			missing: 'index.ts',
		});
	}

	return violations;
}

export function printNoMissingSchemaBarrels(cloc: ClocResult): void {
	const violations = checkMissingSchemaBarrels(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All schemas folders have index.ts',
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
			header: 'SCHEMAS PATH',
			width: 70,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'MISSING',
			width: 20,
			render: (v) => ({
				text: v.missing,
				color: red,
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
			`Missing schemas barrels (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
