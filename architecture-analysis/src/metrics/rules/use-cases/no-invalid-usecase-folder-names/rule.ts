import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	domain: string;
	path: string;
	folder: string;
	reason: string;
};

const USE_CASE_FILE_REGEX =
	/^src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/](commands|queries)[\\/][^\\/]+[\\/].+\.ts$/;
const USE_CASE_FOLDER_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizePath(file: string): string {
	return file.replace(/\\/g, '/');
}

export function checkInvalidUseCaseFolderNames(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalizePath(rawPath);
		if (!USE_CASE_FILE_REGEX.test(path)) continue;

		const parts = path.split('/');
		const rootNamespace = parts[1];
		const domainName = parts[2];
		const folder = parts[5];
		if (!rootNamespace || !domainName || !folder) continue;

		if (USE_CASE_FOLDER_REGEX.test(folder)) continue;

		const domainPath = `src/${rootNamespace}/${domainName}/use-cases`;
		const key = `${domainPath}|${folder}`;
		if (seen.has(key)) continue;
		seen.add(key);

		violations.push({
			domain: domainName,
			path: `${domainPath}/${folder}`,
			folder,
			reason: 'Use-case folders must use kebab-case',
		});
	}

	return violations.sort((a, b) =>
		a.path === b.path
			? a.folder.localeCompare(b.folder)
			: a.path.localeCompare(b.path),
	);
}

export function printNoInvalidUseCaseFolderNames(cloc: ClocResult): void {
	const violations = checkInvalidUseCaseFolderNames(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'Use-case folders use kebab-case action names',
				ADR.useCaseFolderNames,
			),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'DOMAIN',
			width: 25,
			render: (v) => ({ text: v.domain, color: red }),
		},
		{
			header: 'USE-CASES PATH',
			width: 55,
			render: (v) => ({ text: v.path }),
		},
		{
			header: 'FOLDER',
			width: 28,
			render: (v) => ({ text: v.folder, color: yellow }),
		},
		{
			header: 'REASON',
			width: 30,
			render: (v) => ({ text: v.reason, color: yellow }),
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printTable(
		withAdr(
			`Use-case folder name violations (${violations.length})`,
			ADR.useCaseFolderNames,
		),
		columns,
		violations,
	);
}
