import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import { green, red, yellow } from 'kleur/colors';
import {
	extractDomainFromPath,
	extractIntegrationTestDomainFromPath,
	isTestFile,
} from '../../utils/Utils';
import { ADR, withAdr } from '../adr-labels';

type DomainCodeStats = {
	domain: string;
	totalFiles: number;
	totalLOC: number;
	totalComments: number;
	totalBlanks: number;
	testLOC: number;
	testPercent: number;
};

export function calculateDomainCodeStats(cloc: ClocResult): DomainCodeStats[] {
	const domainMap = new Map<
		string,
		{
			files: number;
			code: number;
			comments: number;
			blanks: number;
			testLOC: number;
		}
	>();

	for (const [file, info] of Object.entries(cloc)) {
		if (file === 'SUM' || file === 'header') continue;

		if (!('code' in info)) continue;

		const domain =
			extractDomainFromPath(file) ?? extractIntegrationTestDomainFromPath(file);
		if (!domain) continue;

		const stats = domainMap.get(domain) ?? {
			files: 0,
			code: 0,
			comments: 0,
			blanks: 0,
			testLOC: 0,
		};

		stats.files++;
		stats.code += info.code;
		stats.comments += info.comment;
		stats.blanks += info.blank;
		if (isTestFile(file)) stats.testLOC += info.code;

		domainMap.set(domain, stats);
	}

	return [...domainMap.entries()].map(([domain, stats]) => ({
		domain,
		totalFiles: stats.files,
		totalLOC: stats.code,
		totalComments: stats.comments,
		totalBlanks: stats.blanks,
		testLOC: stats.testLOC,
		testPercent: stats.code === 0 ? 0 : (stats.testLOC / stats.code) * 100,
	}));
}

function classifyTestCoverage(testsPercent: number) {
	let label: 'GOOD' | 'OK' | 'FAIL';
	if (testsPercent >= 40) label = 'GOOD';
	else if (testsPercent >= 20) label = 'OK';
	else label = 'FAIL';
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

// eslint-disable-next-line max-lines-per-function
export function printDomainCodeStats(cloc: ClocResult): void {
	const metrics = calculateDomainCodeStats(cloc);
	const totals = metrics.reduce(
		(acc, m) => ({
			totalFiles: acc.totalFiles + m.totalFiles,
			totalLOC: acc.totalLOC + m.totalLOC,
			totalComments: acc.totalComments + m.totalComments,
			totalBlanks: acc.totalBlanks + m.totalBlanks,
			testLOC: acc.testLOC + m.testLOC,
		}),
		{
			totalFiles: 0,
			totalLOC: 0,
			totalComments: 0,
			totalBlanks: 0,
			testLOC: 0,
		},
	);
	const totalPercent =
		totals.totalLOC === 0 ? 0 : (totals.testLOC / totals.totalLOC) * 100;

	const columns: TableColumn<DomainCodeStats>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifyTestCoverage(m.testPercent).color,
			}),
		},
		{
			header: 'FILES',
			width: 6,
			align: 'right',
			render: (m) => ({ text: String(m.totalFiles) }),
		},
		{
			header: 'LOC',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.totalLOC) }),
		},
		{
			header: 'COMMENTS',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.totalComments) }),
		},
		{
			header: 'BLANKS',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.totalBlanks) }),
		},
		{
			header: 'TEST LOC',
			width: 8,
			align: 'right',
			render: (m) => ({ text: String(m.testLOC) }),
		},
		{
			header: '% TEST LINES',
			width: 13,
			align: 'right',
			render: (m) => {
				return {
					text: m.testPercent.toFixed(2) + '%',
					color: classifyTestCoverage(m.testPercent).color,
				};
			},
		},
		{
			header: 'STATUS',
			width: 12,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyTestCoverage(m.testPercent);
				return { text: label, color };
			},
		},
	];
	const sortedMetrics = metrics.sort((a, b) => b.testPercent - a.testPercent);
	const totalRow: DomainCodeStats = {
		domain: 'TOTAL',
		totalFiles: totals.totalFiles,
		totalLOC: totals.totalLOC,
		totalComments: totals.totalComments,
		totalBlanks: totals.totalBlanks,
		testLOC: totals.testLOC,
		testPercent: totalPercent,
	};
	printTable(
		withAdr('Domain Code Metrics (by lines of test code)', ADR.domainTests),
		columns,
		[...sortedMetrics, totalRow],
	);
}
