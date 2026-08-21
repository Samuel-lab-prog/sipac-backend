import fs from 'node:fs';
import ts from 'typescript';
import { red, yellow } from 'kleur/colors';
import type { ClocResult } from '../../../Types';
import { printTable, type TableColumn } from '../../../../utils/PrintTable';
import { ADR, withAdr } from '../../../adr-labels';
import { formatRuleSuccess } from '../../../../utils/Utils';

type Violation = {
	file: string;
	rule: string;
	details: string;
};

const USE_CASE_FILE_REGEX =
	/^src[\\/](domains|generic-subdomains)[\\/][^\\/]+[\\/]use-cases[\\/].*execute\.ts$/;
const USE_CASE_FILE_EXCLUSIONS =
	/(?:^|[\\/])(index|Index)\.ts$|[\\/](test-helpers|policies)[\\/]|\.test\.ts$|\.spec\.ts$/i;

function normalizePath(file: string): string {
	return file.replace(/\\/g, '/');
}

function getModifiers(node: ts.Node): readonly ts.Node[] | undefined {
	return 'modifiers' in node
		? (node as { modifiers?: readonly ts.Node[] }).modifiers
		: undefined;
}

function isExported(node: ts.Node): boolean {
	return (getModifiers(node) ?? []).some(
		(modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
	);
}

function hasDefaultExport(node: ts.Node): boolean {
	return (getModifiers(node) ?? []).some(
		(modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
	);
}

function getFunctionLikeParameters(
	statement: ts.Statement,
): readonly ts.ParameterDeclaration[] {
	if (ts.isFunctionDeclaration(statement)) return statement.parameters;

	if (!ts.isVariableStatement(statement)) return [];

	const declaration = statement.declarationList.declarations[0];
	if (!declaration) return [];

	const initializer = declaration.initializer;
	if (
		!initializer ||
		!(ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
	) {
		return [];
	}

	return initializer.parameters;
}

function getFunctionLikeName(statement: ts.Statement): string | undefined {
	if (ts.isFunctionDeclaration(statement)) return statement.name?.text;

	if (!ts.isVariableStatement(statement)) return undefined;

	const declaration = statement.declarationList.declarations[0];
	return declaration?.name.getText();
}

function getFactoryViolations(file: string): Violation[] {
	const content = fs.readFileSync(file, 'utf8');
	const sourceFile = ts.createSourceFile(
		file,
		content,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);

	const violations: Violation[] = [];
	const pushViolation = (rule: string, details: string): void => {
		if (
			violations.some(
				(violation) => violation.rule === rule && violation.details === details,
			)
		) {
			return;
		}

		violations.push({ file, rule, details });
	};

	for (const statement of sourceFile.statements) {
		if (ts.isExportAssignment(statement)) {
			pushViolation(
				'default export',
				'Use-case factories must use named exports.',
			);
			continue;
		}

		if (!isExported(statement)) continue;
		if (
			!ts.isFunctionDeclaration(statement) &&
			!ts.isVariableStatement(statement)
		) {
			continue;
		}

		if (hasDefaultExport(statement)) {
			pushViolation(
				'default export',
				'Use-case factories must use named exports.',
			);
		}

		const name = getFunctionLikeName(statement);
		if (name && !name.endsWith('Factory')) {
			pushViolation(
				'factory name',
				`Expected a name ending with Factory, found ${name}.`,
			);
		}

		const parameters = getFunctionLikeParameters(statement);
		if (parameters.length !== 1) {
			pushViolation(
				'parameter count',
				`Expected exactly one dependency parameter, found ${parameters.length}.`,
			);
			continue;
		}

		const parameterType = parameters[0]?.type?.getText(sourceFile).trim();
		if (!parameterType || !parameterType.endsWith('Dependencies')) {
			pushViolation(
				'dependency type',
				'Dependency parameter must use a type whose name ends with Dependencies.',
			);
		}
	}

	return violations;
}

export function checkInvalidUseCaseFactories(cloc: ClocResult): Violation[] {
	const violations: Violation[] = [];

	for (const [rawPath, info] of Object.entries(cloc)) {
		if (rawPath === 'SUM' || rawPath === 'header') continue;
		if (!('code' in info)) continue;

		const file = normalizePath(rawPath);
		if (!USE_CASE_FILE_REGEX.test(file)) continue;
		if (USE_CASE_FILE_EXCLUSIONS.test(file)) continue;

		violations.push(...getFactoryViolations(file));
	}

	return violations.sort((a, b) =>
		a.file === b.file
			? a.rule.localeCompare(b.rule) || a.details.localeCompare(b.details)
			: a.file.localeCompare(b.file),
	);
}

export function printNoInvalidUseCaseFactories(cloc: ClocResult): void {
	const violations = checkInvalidUseCaseFactories(cloc);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'Use-case factories use a single explicit signature',
				ADR.useCaseFactorySignature,
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
			header: 'RULE',
			width: 22,
			render: (v) => ({ text: v.rule, color: yellow }),
		},
		{
			header: 'DETAILS',
			width: 52,
			render: (v) => ({ text: v.details, color: yellow }),
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
			`Use-case factories use a single explicit signature (${violations.length})`,
			ADR.useCaseFactorySignature,
		),
		columns,
		violations,
	);
}
