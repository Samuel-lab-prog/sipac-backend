import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { makeClocResult } from '../../test-helpers/fixtures';
import { withTemporaryDomainFile } from '../../test-helpers/filesystem';
import { checkInvalidUseCaseFolderNames } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Usecase Folder Names', () => {
	it('ARCHITECTURE-RULE flags non-kebab-case use-case folders', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-folder-name-rule__',
			'use-cases',
			'commands',
			'CreatePoem',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-folder-name-rule__',
			relativeFile,
			[
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function CreatePoemFactory(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
			() => {
				const violations = checkInvalidUseCaseFolderNames(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(1);
				expect(violations[0]?.folder).toBe('CreatePoem');
			},
		);
	});

	it('ARCHITECTURE-RULE allows kebab-case use-case folders', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-folder-name-rule__',
			'use-cases',
			'queries',
			'create-poem',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-folder-name-rule__',
			relativeFile,
			[
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function createPoemFactory(deps: Dependencies) {',
				'\treturn deps.service;',
				'}',
			].join('\n'),
			() => {
				const violations = checkInvalidUseCaseFolderNames(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(0);
			},
		);
	});
});
