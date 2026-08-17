import type { ClocResult, DomainMetric, DomainAggregate } from '../Types';

const IGNORED_DOMAINS: string[] = [];

export function calculateDomainAggregates(
	cloc: ClocResult,
): Map<string, DomainAggregate> {
	const domainData = new Map<string, DomainAggregate>();

	Object.entries(cloc).forEach(([file, info]) => {
		if (file === 'SUM' || ('code' in info && !info?.code)) return;

		const match = file.match(
			/(?:^|\/|\\)src[/\\](domains|generic-subdomains)[/\\]([^/\\]+)[/\\]/,
		);

		if (!match) return;

		const domainName = match[2]!;
		if (IGNORED_DOMAINS.includes(domainName)) return;

		const current = domainData.get(domainName) ?? { loc: 0, files: 0 };

		if (!('code' in info)) return;

		domainData.set(domainName, {
			loc: current.loc + info.code,
			files: current.files + 1,
		});
	});

	return domainData;
}

export function calculateDomainStatistics(
	domainData: Map<string, DomainAggregate>,
	totalLoc: number,
): DomainMetric[] {
	const locValues = [...domainData.values()].map((d) => d.loc);

	const mean = locValues.reduce((a, b) => a + b, 0) / locValues.length;

	const variance =
		locValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / locValues.length;

	const stdDev = Math.sqrt(variance) || 1;

	return [...domainData.entries()].map(([domain, data]) => ({
		domain,
		loc: data.loc,
		files: data.files,
		percent: data.loc / totalLoc,
		zScore: (data.loc - mean) / stdDev,
	}));
}

import { red, yellow, green } from 'kleur/colors';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import { ADR, withAdr } from '../adr-labels';

function classifySizeResult(percent: number): {
	label: string;
	color: (text: string) => string;
} {
	const abs = Math.abs(percent);
	let label: 'GOOD' | 'OK' | 'FAIL';
	if (abs <= 0.3) label = 'GOOD';
	else if (abs <= 0.5) label = 'OK';
	else label = 'FAIL';
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

export function printDomainStatistics(clocResult: ClocResult): void {
	const totalLoc = clocResult.SUM.code;
	const domainAggregates = calculateDomainAggregates(clocResult);
	const metrics = calculateDomainStatistics(domainAggregates, totalLoc);
	const columns: TableColumn<DomainMetric>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifySizeResult(m.percent).color,
			}),
		},
		{
			header: 'LOC',
			width: 15,
			align: 'right',
			render: (m) => ({ text: String(m.loc) }),
		},
		{
			header: 'FILES',
			width: 15,
			align: 'right',
			render: (m) => ({ text: String(m.files) }),
		},
		{
			header: '% TOTAL',
			width: 15,
			align: 'right',
			render: (m) => ({
				text: `${(m.percent * 100).toFixed(1)}%`,
			}),
		},
		{
			header: 'Z-SCORE',
			width: 15,
			align: 'right',
			render: (m) => {
				const { color } = classifySizeResult(m.percent);
				return {
					text: m.zScore.toFixed(2),
					color,
				};
			},
		},
		{
			header: 'STATUS',
			width: 13,
			align: 'right',
			render: (m) => {
				const { label, color } = classifySizeResult(m.percent);
				return { text: label, color };
			},
		},
	];

	printTable(
		withAdr('Domain Size Metrics', ADR.domainSize),
		columns,
		[...metrics].sort((a, b) => b.loc - a.loc),
	);
}
