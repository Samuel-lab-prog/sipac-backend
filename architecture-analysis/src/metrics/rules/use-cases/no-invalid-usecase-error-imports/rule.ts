import fs from 'node:fs';
import ts from 'typescript';
import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	file: string;
	importPath: string;
	errorName: string;
};

const USE_CASE_FILE_REGEX =
	/^src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/].+\.ts$/;
const USE_CASE_FILE_EXCLUSIONS =
	/(?:^|[\\/])(index|Index)\.ts$|[\\/](test-helpers)[\\/]/i;
const DOMAIN_ERROR_ALIAS = '@DomainError';
const DOMAIN_ERROR_IMPORT_PATTERN = /domain[-]?error/i;

function normalizePath(file: string): string {
	return file.replace(/\\/g, '/');
}

function isExportedUseCaseFile(rawPath: string): boolean {
	const file = normalizePath(rawPath);
	return USE_CASE_FILE_REGEX.test(file) && !USE_CASE_FILE_EXCLUSIONS.test(file);
}

function findImportViolations(file: string): Violation[] {
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
		if (!ts.isImportDeclaration(statement)) continue;
		if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

		const importPath = statement.moduleSpecifier.text;
		if (importPath === DOMAIN_ERROR_ALIAS) continue;
		if (!DOMAIN_ERROR_IMPORT_PATTERN.test(importPath)) continue;

		const clause = statement.importClause;
		if (!clause) continue;

		const bindings = clause.namedBindings;
		if (!bindings || !ts.isNamedImports(bindings)) continue;

		for (const element of bindings.elements) {
			const importedName = element.propertyName?.text ?? element.name.text;
			if (!importedName.endsWith('Error')) continue;

			violations.push({
				file,
				importPath,
				errorName: importedName,
			});
		}
	}

	return violations;
}

export function checkInvalidUseCaseErrorImports(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;
		if (!isExportedUseCaseFile(rawPath)) continue;

		const file = normalizePath(rawPath);
		violations.push(...findImportViolations(file));
	}

	return violations.sort((a, b) =>
		a.file === b.file
			? a.errorName.localeCompare(b.errorName) ||
				a.importPath.localeCompare(b.importPath)
			: a.file.localeCompare(b.file),
	);
}

export function printNoInvalidUseCaseErrorImports(cloc: ClocResult): void {
	const violations = checkInvalidUseCaseErrorImports(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'Use-case errors must come from @DomainError',
				ADR.useCaseDomainErrorAlias,
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
			header: 'ERROR',
			width: 24,
			render: (v) => ({ text: v.errorName, color: yellow }),
		},
		{
			header: 'IMPORT PATH',
			width: 44,
			render: (v) => ({ text: v.importPath, color: yellow }),
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
			`Use-case error import violations (${violations.length})`,
			ADR.useCaseDomainErrorAlias,
		),
		columns,
		violations,
	);
}
