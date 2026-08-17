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

type RepoInfo = {
	domain: string;
	path: string;
	files: Set<string>;
};

const ALLOWED_FILES = new Set([
	'repository.ts',
	'selects.ts',
	'helpers.ts',
	'helpers.test.ts',
]);

const REPO_REGEX =
	/^src\/(domains|generic-subdomains)\/([^/]+)\/infra\/(commands-repository|queries-repository)\/(.+)/;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

export function checkInvalidRepositoryFiles(cloc: ClocResult): Violation[] {
	const repos = new Map<string, RepoInfo>();
	const violations: Violation[] = [];
	const seen = new Set<string>();

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const path = normalize(rawPath);
		const match = path.match(REPO_REGEX);
		if (!match) continue;

		const [, rootNamespace, domainName, repoType, rest] = match;
		if (!rootNamespace || !domainName || !repoType || !rest) continue;

		const repoPath = `src/${rootNamespace}/${domainName}/infra/${repoType}`;
		const repo =
			repos.get(repoPath) ??
			({
				domain: domainName,
				path: repoPath,
				files: new Set<string>(),
			} satisfies RepoInfo);
		repos.set(repoPath, repo);

		if (rest.includes('/')) {
			const entry = rest.split('/')[0]!;
			const key = `${repoPath}|${entry}|subdir`;
			if (!seen.has(key)) {
				seen.add(key);
				violations.push({
					domain: domainName,
					path: repoPath,
					entry,
					reason: 'Subdirectories are not allowed',
				});
			}
			continue;
		}

		repo.files.add(rest);
		if (!ALLOWED_FILES.has(rest)) {
			const key = `${repoPath}|${rest}|invalid-file`;
			if (seen.has(key)) continue;
			seen.add(key);
			violations.push({
				domain: domainName,
				path: repoPath,
				entry: rest,
				reason: 'Invalid file name',
			});
		}
	}

	for (const repo of repos.values()) {
		if (repo.files.has('repository.ts')) continue;

		const key = `${repo.path}|repository.ts|missing`;
		if (seen.has(key)) continue;
		seen.add(key);
		violations.push({
			domain: repo.domain,
			path: repo.path,
			entry: 'repository.ts',
			reason: 'Missing repository.ts',
		});
	}

	return violations;
}

export function printNoInvalidRepositoryFiles(cloc: ClocResult): void {
	const violations = checkInvalidRepositoryFiles(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'All repository folders follow file rules',
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
			header: 'REPO PATH',
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
			`Repository file violations (${violations.length})`,
			ADR.mandatoryDomainFolders,
		),
		columns,
		violations,
	);
}
