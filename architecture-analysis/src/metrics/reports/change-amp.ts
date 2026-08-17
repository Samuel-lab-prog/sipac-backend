import { red, green, yellow } from 'kleur/colors';
import { execSync } from 'child_process';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import { extractDomainFromPath } from '../../utils/Utils';
import { ADR, withAdr } from '../adr-labels';

type ChangeAmplificationMetric = {
	domain: string;
	commits: number;
	avgFilesChanged: number;
	maxFilesChanged: number;
};

function collectCommitChanges(commitLimit: number): string[][] {
	const raw = execSync(
		`git log -n ${commitLimit} --name-only --pretty=format:`,
		{ encoding: 'utf-8' },
	);

	return raw
		.split('\n\n')
		.map((block) =>
			block
				.split('\n')
				.map((line) => line.trim())
				.filter((file) => file.startsWith('src/') && file.endsWith('.ts')),
		)
		.filter((files) => files.length > 1);
}

export function calculateChangeAmplification(
	commitLimit = 100,
): ChangeAmplificationMetric[] {
	const commits = collectCommitChanges(commitLimit);

	const domainStats = new Map<
		string,
		{ commits: number; totalFiles: number; maxFiles: number }
	>();

	for (const files of commits) {
		const domains = new Set(
			files.map(extractDomainFromPath).filter(Boolean) as string[],
		);

		for (const domain of domains) {
			if (!domainStats.has(domain)) {
				domainStats.set(domain, { commits: 0, totalFiles: 0, maxFiles: 0 });
			}

			const filesInDomain = files.filter(
				(f) => extractDomainFromPath(f) === domain,
			).length;
			const stats = domainStats.get(domain)!;

			stats.commits++;
			stats.totalFiles += filesInDomain;
			stats.maxFiles = Math.max(stats.maxFiles, filesInDomain);
		}
	}

	return [...domainStats.entries()].map(([domain, stats]) => ({
		domain,
		commits: stats.commits,
		avgFilesChanged: stats.totalFiles / (stats.commits || 1),
		maxFilesChanged: stats.maxFiles,
	}));
}

function classifyMetric(avg: number, max: number) {
	let label: 'GOOD' | 'OK' | 'FAIL';
	if (avg > 25 || max > 35) label = 'FAIL';
	else if (avg > 18 || max > 25) label = 'OK';
	else label = 'GOOD';
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

const COMMITS_TO_ANALYZE = 20;

export function printChangeAmplification(): void {
	const metrics = calculateChangeAmplification(COMMITS_TO_ANALYZE);

	const columns: TableColumn<ChangeAmplificationMetric>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifyMetric(m.avgFilesChanged, m.maxFilesChanged).color,
			}),
		},
		{
			header: 'COMMITS',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.commits) }),
		},
		{
			header: 'AVG FILES',
			width: 20,
			align: 'right',
			render: (m) => {
				const { color } = classifyMetric(m.avgFilesChanged, m.maxFilesChanged);
				return { text: m.avgFilesChanged.toFixed(2), color };
			},
		},
		{
			header: 'MAX FILES',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.maxFilesChanged) }),
		},
		{
			header: 'STATUS',
			width: 16,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyMetric(
					m.avgFilesChanged,
					m.maxFilesChanged,
				);
				return { text: label, color };
			},
		},
	];

	const sorted = [...metrics].sort(
		(a, b) => b.avgFilesChanged - a.avgFilesChanged,
	);

	printTable(
		withAdr(
			`Change Amplification Metrics (last ${COMMITS_TO_ANALYZE} commits)`,
			ADR.changeAmplification,
		),
		columns,
		sorted,
	);
}
