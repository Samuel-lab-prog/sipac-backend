import fs from 'node:fs';
import ts from 'typescript';
import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	file: string;
	declaration: string;
};

const USE_CASE_FILE_REGEX =
	/^src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/].+\.ts$/;
const USE_CASE_FILE_EXCLUSIONS =
	/(?:^|[\\/])(index|Index)\.ts$|[\\/](test-helpers|policies)[\\/]|\.test\.ts$|\.spec\.ts$/i;

function normalize(path: string): string {
	return path.replace(/\\/g, '/');
}

function hasExportModifier(
	node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
): boolean {
	return (
		node.modifiers?.some(
			(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
		) ?? false
	);
}

function findExportedDependencies(file: string): Violation[] {
	const content = fs.readFileSync(file, 'utf8');
	const sourceFile = ts.createSourceFile(
		file,
		content,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);

	const violations: Violation[] = [];

	for (const statement of sourceFile.statements) {
		if (
			(ts.isInterfaceDeclaration(statement) ||
				ts.isTypeAliasDeclaration(statement)) &&
			statement.name.text === 'Dependencies' &&
			hasExportModifier(statement)
		) {
			violations.push({
				file,
				declaration:
					statement.kind === ts.SyntaxKind.InterfaceDeclaration
						? 'export interface Dependencies'
						: 'export type Dependencies',
			});
			continue;
		}

		if (ts.isExportDeclaration(statement) && statement.exportClause) {
			if (!ts.isNamedExports(statement.exportClause)) continue;

			for (const element of statement.exportClause.elements) {
				if (element.name.text !== 'Dependencies') continue;
				violations.push({
					file,
					declaration: 'export { Dependencies }',
				});
			}
		}
	}

	return violations;
}

export function checkExportedUseCaseDependencies(
	cloc: ClocResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const file = normalize(rawPath);
		if (!USE_CASE_FILE_REGEX.test(file)) continue;
		if (USE_CASE_FILE_EXCLUSIONS.test(file)) continue;

		for (const violation of findExportedDependencies(file)) {
			violations.push(violation);
		}
	}

	return violations.sort((a, b) =>
		a.file === b.file
			? a.declaration.localeCompare(b.declaration)
			: a.file.localeCompare(b.file),
	);
}

export function printNoExportedUseCaseDependencies(cloc: ClocResult): void {
	const violations = checkExportedUseCaseDependencies(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'Use-case dependency contracts stay private',
				ADR.useCaseDependenciesPrivate,
			),
		);
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FILE',
			width: 68,
			render: (v) => ({ text: v.file, color: red }),
		},
		{
			header: 'DECLARATION',
			width: 30,
			render: (v) => ({ text: v.declaration, color: yellow }),
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
			`Exported use-case dependency contracts (${violations.length})`,
			ADR.useCaseDependenciesPrivate,
		),
		columns,
		violations,
	);
}
