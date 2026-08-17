import { red, green, yellow } from 'kleur/colors';
import { printTable, type TableColumn } from '../../utils/PrintTable';
import type { DepcruiseResult } from '../Types';
import { extractDomainFromPath } from '../../utils/Utils';
import { ADR, withAdr } from '../adr-labels';

type DomainIsolationMetric = {
	domain: string;
	internalDeps: number;
	externalDeps: number;
	externalPercent: number;
};

const IGNORED_DOMAINS_IMPORTS_FROM = [
	'shared-kernel',
	'utils',
	'bun:test',
	'generic-subdomains',
];
const IGNORED_DOMAINS: string[] = [];

export function calculateDomainIsolation(
	cruiseResult: DepcruiseResult,
): DomainIsolationMetric[] {
	const acc = new Map<string, { internal: number; external: number }>();

	cruiseResult.modules.forEach((module) => {
		const fromDomain = extractDomainFromPath(module.source);
		if (!fromDomain || IGNORED_DOMAINS.includes(fromDomain)) return;

		if (!acc.has(fromDomain)) acc.set(fromDomain, { internal: 0, external: 0 });

		module.dependencies.forEach((dep) => {
			const toDomain = extractDomainFromPath(dep.resolved);

			if (!toDomain || IGNORED_DOMAINS_IMPORTS_FROM.includes(toDomain)) return;

			const record = acc.get(fromDomain)!;

			if (toDomain === fromDomain) record.internal++;
			else record.external++;
		});
	});

	return [...acc.entries()].map(([domain, counts]) => {
		const total = counts.internal + counts.external || 1;
		return {
			domain,
			internalDeps: counts.internal,
			externalDeps: counts.external,
			externalPercent: counts.external / total,
		};
	});
}

function classifyMetric(externalPercent: number) {
	let label: 'GOOD' | 'OK' | 'FAIL';
	if (externalPercent <= 0.2) label = 'GOOD';
	else if (externalPercent <= 0.5) label = 'OK';
	else label = 'FAIL';
	if (label === 'GOOD') return { label, color: green };
	if (label === 'OK') return { label, color: yellow };
	return { label, color: red };
}

export function printDomainIsolation(cruiseResult: DepcruiseResult): void {
	const metrics = calculateDomainIsolation(cruiseResult);

	const columns: TableColumn<DomainIsolationMetric>[] = [
		{
			header: 'DOMAIN',
			width: 32,
			render: (m) => ({
				text: m.domain,
				color: classifyMetric(m.externalPercent).color,
			}),
		},
		{
			header: 'INT DEPS',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.internalDeps) }),
		},
		{
			header: 'EXT DEPS',
			width: 20,
			align: 'right',
			render: (m) => ({ text: String(m.externalDeps) }),
		},
		{
			header: '% EXT',
			width: 20,
			align: 'right',
			render: (m) => {
				const { color } = classifyMetric(m.externalPercent);
				return { text: `${(m.externalPercent * 100).toFixed(1)}%`, color };
			},
		},
		{
			header: 'STATUS',
			width: 15,
			align: 'right',
			render: (m) => {
				const { label, color } = classifyMetric(m.externalPercent);
				return { text: label, color };
			},
		},
	];

	printTable(
		withAdr('Domain Isolation Metrics', ADR.domainIsolation),
		columns,
		metrics.sort((a, b) => b.externalPercent - a.externalPercent),
	);
}
