import { red } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	domain: string;
	path: string;
	folder: string;
	missing: string;
};

const USE_CASE_FOLDER_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/use-cases\/(commands|queries)\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkMissingUseCaseBarrels(cloc: ClocResult): Violation[] {
	const folders = new Map<
		string,
		{ domain: string; path: string; folder: string; hasIndex: boolean }
	>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(USE_CASE_FOLDER_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, useCaseFolder, rest] = match;
		if (!rootNamespace || !domainName || !useCaseFolder || !rest) continue;

		const folderPath = `src/${rootNamespace}/${domainName}/use-cases/${useCaseFolder}`;
		const entry = folders.get(folderPath) ?? {
			domain: domainName,
			path: folderPath,
			folder: useCaseFolder,
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
			folder: folder.folder,
			missing: 'index.ts',
		});
	}

	return violations;
}

export function printNoMissingUseCaseBarrels(cloc: ClocResult): void {
	const violations = checkMissingUseCaseBarrels(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All use-cases commands/queries folders have index.ts',
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
			header: 'USE-CASE PATH',
			width: 55,
			render: (v) => ({
				text: v.path,
			}),
		},
		{
			header: 'FOLDER',
			width: 18,
			render: (v) => ({
				text: v.folder,
				color: red,
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
			`Missing use-case barrels (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
