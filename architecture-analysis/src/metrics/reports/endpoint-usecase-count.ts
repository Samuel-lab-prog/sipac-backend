import fs from 'fs';
import path from 'path';
import type { ClocResult } from '../Types';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import { ADR, withAdr } from '../adr-labels';

type TotalMetric = {
	label: string;
	value: number;
};

const USE_CASE_PATTERN =
	/(?:^|[\\/])src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/].+[\\/]execute\.ts$/;

const ROUTER_PATTERN =
	/(?:^|[\\/])src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]adapters[\\/].+Router\.ts$/;

const ENDPOINT_CALL_PATTERN =
	/\.(get|post|put|patch|delete|options|head)\s*\(/g;

function resolveClocPath(filePath: string): string | null {
	if (fs.existsSync(filePath)) return filePath;

	const cwd = process.cwd();
	const candidate = path.resolve(cwd, filePath);
	if (fs.existsSync(candidate)) return candidate;

	const parentCandidate = path.resolve(cwd, '..', filePath);
	if (fs.existsSync(parentCandidate)) return parentCandidate;

	return null;
}

function countUseCases(cloc: ClocResult): number {
	let total = 0;

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		if (USE_CASE_PATTERN.test(file)) total += 1;
	}

	return total;
}

function countEndpoints(cloc: ClocResult): number {
	let total = 0;

	for (const file of Object.keys(cloc)) {
		if (file === 'SUM' || file === 'header') continue;
		if (!ROUTER_PATTERN.test(file)) continue;

		const resolved = resolveClocPath(file);
		if (!resolved) continue;

		const content = fs.readFileSync(resolved, 'utf-8');
		const matches = content.match(ENDPOINT_CALL_PATTERN);
		if (matches) total += matches.length;
	}

	return total;
}

export function printEndpointAndUseCaseTotals(cloc: ClocResult): void {
	const totals: TotalMetric[] = [
		{ label: 'TOTAL ENDPOINTS', value: countEndpoints(cloc) },
		{ label: 'TOTAL USE-CASES', value: countUseCases(cloc) },
	];

	const columns: TableColumn<TotalMetric>[] = [
		{
			header: 'METRIC',
			width: 90,
			render: (m) => ({ text: m.label }),
		},
		{
			header: 'TOTAL',
			width: 27,
			align: 'right',
			render: (m) => ({ text: String(m.value) }),
		},
	];

	printTable(
		withAdr('Endpoint & Use-Case Totals', ADR.architecturalMetrics),
		columns,
		totals,
	);
}
