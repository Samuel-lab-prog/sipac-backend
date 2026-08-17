import type { ClocResult, DepcruiseResult } from '../Types';
import { green, yellow, red, magenta } from 'kleur/colors';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import {
	extractDomainFromPath,
	isAbstractFile,
	isTestFile,
	classifyDomainKind,
	type DomainKind,
} from '../../utils/Utils';
import { ADR, withAdr } from '../adr-labels';

export type DomainArchitectureMetric = {
	domain: string;
	kind: DomainKind;
	abstractness: number;
	instability: number;
	distance: number;
	ca: number;
	ce: number;
};

function calculateAbstraction(cloc: ClocResult): Map<string, number> {
	const totalFiles = new Map<string, number>();
	const abstractFiles = new Map<string, number>();

	for (const [key, _value] of Object.entries(cloc)) {
		if (key === 'header' || key === 'SUM') continue;

		const domain = extractDomainFromPath(key);
		if (!domain) continue;

		if (isTestFile(key)) continue;

		totalFiles.set(domain, (totalFiles.get(domain) ?? 0) + 1);

		if (isAbstractFile(key))
			abstractFiles.set(domain, (abstractFiles.get(domain) ?? 0) + 1);
	}

	const abstraction = new Map<string, number>();
	for (const domain of totalFiles.keys()) {
		const abs = abstractFiles.get(domain) ?? 0;
		const total = totalFiles.get(domain)!;
		abstraction.set(domain, total === 0 ? 0 : abs / total);
	}
	return abstraction;
}

function calculateInstability(
	depcruise: DepcruiseResult,
): Map<string, { ca: number; ce: number; instability: number }> {
	const ca = new Map<string, number>();
	const ce = new Map<string, number>();

	for (const module of depcruise.modules) {
		const fromDomain = extractDomainFromPath(module.source);
		if (!fromDomain) continue;

		if (isTestFile(module.source)) continue;

		for (const dep of module.dependencies ?? []) {
			const toDomain = extractDomainFromPath(dep.resolved);
			if (!toDomain || toDomain === fromDomain) continue;
			if (isTestFile(dep.resolved)) continue;

			ce.set(fromDomain, (ce.get(fromDomain) ?? 0) + 1);
			ca.set(toDomain, (ca.get(toDomain) ?? 0) + 1);
		}
	}

	const result = new Map<
		string,
		{ ca: number; ce: number; instability: number }
	>();

	const domains = new Set([...ca.keys(), ...ce.keys()]);
	for (const domain of domains) {
		const caVal = ca.get(domain) ?? 0;
		const ceVal = ce.get(domain) ?? 0;
		const total = caVal + ceVal;

		result.set(domain, {
			ca: caVal,
			ce: ceVal,
			instability: total === 0 ? 0 : ceVal / total,
		});
	}

	return result;
}

function calculateAbstractionInstability(
	cloc: ClocResult,
	depcruise: DepcruiseResult,
): DomainArchitectureMetric[] {
	const abstraction = calculateAbstraction(cloc);
	const instability = calculateInstability(depcruise);

	const domains = new Set([...abstraction.keys(), ...instability.keys()]);

	const metrics: DomainArchitectureMetric[] = [];

	for (const domain of domains) {
		const A = abstraction.get(domain) ?? 0;
		const inst = instability.get(domain) ?? {
			ca: 0,
			ce: 0,
			instability: 0,
		};

		const I = inst.instability;
		const D = Math.abs(A + I - 1);

		metrics.push({
			domain,
			kind: classifyDomainKind(domain),
			abstractness: A,
			instability: I,
			distance: D,
			ca: inst.ca,
			ce: inst.ce,
		});
	}

	return metrics;
}

// ----------------------- UI Rendering --------------------- //

function classifyDistance(
	distance: number,
	kind: DomainKind,
): {
	label: string;
	color: (text: string) => string;
} {
	if (kind === 'UTILITY') return { label: 'UTILITY', color: magenta };
	if (kind === 'INFRA_SHARED') return { label: 'INFRA', color: magenta };

	if (distance <= 0.25) return { label: 'GOOD', color: green };
	if (distance <= 0.5) return { label: 'OK', color: yellow };
	return { label: 'FAIL', color: red };
}

export function printMainSeqDist(
	clocResult: ClocResult,
	depcruiseResult: DepcruiseResult,
): void {
	const metrics = calculateAbstractionInstability(clocResult, depcruiseResult);
	const columns: TableColumn<DomainArchitectureMetric>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => {
				const { color } = classifyDistance(m.distance, m.kind);
				return { text: m.domain, color };
			},
		},
		{
			header: 'A',
			width: 10,
			align: 'right',
			render: (m) => ({ text: m.abstractness.toFixed(2) }),
		},
		{
			header: 'I',
			width: 10,
			align: 'right',
			render: (m) => ({ text: m.instability.toFixed(2) }),
		},
		{
			header: 'D',
			width: 10,
			align: 'right',
			render: (m) => {
				const { color } = classifyDistance(m.distance, m.kind);
				return { text: m.distance.toFixed(2), color };
			},
		},
		{
			header: 'CA',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.ca) }),
		},
		{
			header: 'CE',
			width: 10,
			align: 'right',
			render: (m) => ({ text: String(m.ce) }),
		},
		{
			header: 'STATUS',
			width: 20,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyDistance(m.distance, m.kind);
				return { text: label, color };
			},
		},
	];
	const sorted = [...metrics].sort((a, b) => b.distance - a.distance);
	printTable(
		withAdr(
			'Instability, Abstraction & Distance from the Main Sequence',
			ADR.mainSequenceDistance,
		),
		columns,
		sorted,
	);
}
