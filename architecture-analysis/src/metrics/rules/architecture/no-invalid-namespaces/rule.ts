import { red, yellow } from 'kleur/colors';
import type { DepcruiseResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import {
	extractRootNamespace,
	formatRuleSuccess,
} from '../../../../utils/Utils';
import { ADR, withAdr } from '../../../adr-labels';

type Violation = {
	module: string;
	rootNamespace: string;
};

const ALLOWED_ROOT_NAMESPACES = new Set([
	'domains',
	'generic-subdomains',
	'server-config',
	'shared-kernel',
	'tests',
]);

export function checkInvalidRootNamespaces(
	cruiseResult: DepcruiseResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;
		if (!source.startsWith('src/')) continue;

		const rootNamespace = extractRootNamespace(source);
		if (!rootNamespace) continue;

		if (!ALLOWED_ROOT_NAMESPACES.has(rootNamespace)) {
			violations.push({
				module: source,
				rootNamespace,
			});
		}
	}

	return violations;
}

export function printNoInvalidRootNamespaces(
	cruiseResult: DepcruiseResult,
): void {
	const violations = checkInvalidRootNamespaces(cruiseResult);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess('All root namespaces are valid', ADR.rootNamespaces),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'ROOT',
			width: 24,
			render: (v) => ({ text: v.rootNamespace, color: yellow }),
		},
		{
			header: 'MODULE',
			width: 80,
			render: (v) => ({ text: v.module }),
		},
		{
			header: 'STATUS',
			width: 10,
			align: 'right',
			render: () => ({ text: 'VIOLATION', color: red }),
		},
	];

	printTable(
		withAdr(
			`Invalid root namespaces (${violations.length})`,
			ADR.rootNamespaces,
		),
		columns,
		violations,
	);
}
