import { describe, expect, it } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { makeClocResult } from '../../test-helpers/fixtures';
import { withTemporaryDomainFile } from '../../test-helpers/filesystem';
import { checkCaseMismatchImports } from './rule';

describe('ARCHITECTURE-RULE - No Case Mismatch Imports', () => {
	it('ARCHITECTURE-RULE flags mismatched import casing and allows exact matches', () => {
		const actualExecuteFile =
			'src/domains/__tmp-case-mismatch-rule__/use-cases/commands/create-poem/Execute.ts';
		const indexFile =
			'src/domains/__tmp-case-mismatch-rule__/use-cases/commands/create-poem/index.ts';

		withTemporaryDomainFile(
			'__tmp-case-mismatch-rule__',
			actualExecuteFile,
			'export const createPoem = 1;',
			() => {
				const absoluteIndex = path.join(process.cwd(), indexFile);
				mkdirSync(path.dirname(absoluteIndex), { recursive: true });
				writeFileSync(
					absoluteIndex,
					[
						"import { createPoem } from './execute';",
						'',
						'export const createPoemFactory = () => createPoem;',
					].join('\n'),
				);

				const violations = checkCaseMismatchImports(
					makeClocResult({
						[actualExecuteFile]: { code: 1 },
						[indexFile]: { code: 1 },
					}),
				);

				expect(violations).toEqual([
					{
						file: indexFile,
						importPath: './execute',
						resolvedPath: actualExecuteFile,
					},
				]);
			},
		);
	});

	it('ARCHITECTURE-RULE ignores barrel imports that resolve to Index files', () => {
		const actualIndexFile =
			'src/domains/__tmp-case-mismatch-rule__/use-cases/commands/create-poem/Index.ts';
		const entryFile =
			'src/domains/__tmp-case-mismatch-rule__/use-cases/commands/create-poem/entry.ts';

		withTemporaryDomainFile(
			'__tmp-case-mismatch-rule__',
			actualIndexFile,
			'export const createPoem = 1;',
			() => {
				const absoluteEntry = path.join(process.cwd(), entryFile);
				mkdirSync(path.dirname(absoluteEntry), { recursive: true });
				writeFileSync(
					absoluteEntry,
					[
						"import { createPoem } from './Index';",
						'',
						'export const createPoemFactory = () => createPoem;',
					].join('\n'),
				);

				const violations = checkCaseMismatchImports(
					makeClocResult({
						[actualIndexFile]: { code: 1 },
						[entryFile]: { code: 1 },
					}),
				);

				expect(violations).toEqual([]);
			},
		);
	});
});
