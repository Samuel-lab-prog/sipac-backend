import { red, yellow } from 'kleur/colors';
import type { DepcruiseResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type CycleViolation = {
	from: string;
	to: string;
	length: number;
	cycle: string;
};

const NO_CIRCULAR_RULE = 'no-circular';
const GENERATED_PRISMA_PATH =
	'src/generic-subdomains/persistance/prisma/generated';

function isGeneratedPrismaPath(path: string): boolean {
	return path.startsWith(GENERATED_PRISMA_PATH);
}

function normalizeCycle(nodes: string[]): string[] {
	const withoutEmpty = nodes.filter(Boolean);
	if (withoutEmpty.length <= 1) return withoutEmpty;

	const first = withoutEmpty[0];
	const last = withoutEmpty[withoutEmpty.length - 1];

	return first === last ? withoutEmpty.slice(0, -1) : withoutEmpty;
}

function canonicalCycleKey(nodes: string[]): string {
	const cycle = normalizeCycle(nodes);
	if (cycle.length === 0) return '';

	const rotations = cycle.flatMap((_, index) => {
		const rotated = [...cycle.slice(index), ...cycle.slice(0, index)];
		const reversed = [...rotated].reverse();
		return [rotated.join('|'), reversed.join('|')];
	});

	return rotations.sort()[0] ?? cycle.join('|');
}

function toCyclePath(from: string, cycleNodes: string[]): string[] {
	const path = [from, ...cycleNodes].filter(Boolean);
	if (path.length <= 1) return path;

	const first = path[0]!;
	const last = path[path.length - 1]!;

	return first === last ? path : [...path, first];
}

function hasGeneratedPrismaPath(nodes: string[]): boolean {
	return nodes.some(isGeneratedPrismaPath);
}

function addCycleViolation(
	violations: CycleViolation[],
	seen: Set<string>,
	from: string,
	to: string,
	cycleNodes: string[],
): void {
	const path = toCyclePath(from, cycleNodes);
	if (hasGeneratedPrismaPath(path)) return;

	const key = canonicalCycleKey(path);
	if (!key || seen.has(key)) return;

	const normalized = normalizeCycle(path);
	seen.add(key);
	violations.push({
		from,
		to,
		length: normalized.length,
		cycle: path.join(' -> '),
	});
}

export function checkCircularDependencies(
	cruiseResult: DepcruiseResult,
): CycleViolation[] {
	const violations: CycleViolation[] = [];
	const seen = new Set<string>();

	for (const violation of cruiseResult.summary.violations ?? []) {
		if (violation.rule.name !== NO_CIRCULAR_RULE) continue;

		addCycleViolation(
			violations,
			seen,
			violation.from,
			violation.to,
			(violation.cycle ?? []).map((step) => step.name),
		);
	}

	for (const module of cruiseResult.modules) {
		for (const dependency of module.dependencies ?? []) {
			if (!dependency.circular) continue;

			addCycleViolation(
				violations,
				seen,
				module.source,
				dependency.resolved,
				(dependency.cycle ?? []).map((step) => step.name),
			);
		}
	}

	return violations.sort((a, b) => a.cycle.localeCompare(b.cycle));
}

export function printNoCircularDependencies(
	cruiseResult: DepcruiseResult,
): void {
	const violations = checkCircularDependencies(cruiseResult);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'No circular dependencies found',
				ADR.circularDependencies,
			),
		);
		return;
	}

	const columns: TableColumn<CycleViolation>[] = [
		{
			header: 'LENGTH',
			width: 8,
			align: 'right',
			render: (v) => ({
				text: String(v.length),
				color: yellow,
			}),
		},
		{
			header: 'FROM',
			width: 58,
			render: (v) => ({
				text: v.from,
				color: red,
			}),
		},
		{
			header: 'CYCLE',
			width: 95,
			render: (v) => ({
				text: v.cycle,
			}),
		},
	];

	printTable(
		withAdr(
			`Circular dependency violations (${violations.length})`,
			ADR.circularDependencies,
		),
		columns,
		violations,
	);
}
