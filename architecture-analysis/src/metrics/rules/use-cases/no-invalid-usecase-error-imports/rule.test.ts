import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { makeClocResult } from '../../test-helpers/fixtures';
import { withTemporaryDomainFile } from '../../test-helpers/filesystem';
import { checkInvalidUseCaseErrorImports } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Usecase Error Imports', () => {
	it('ARCHITECTURE-RULE flags direct imports from the internal domain error module', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-error-import-rule__',
			'use-cases',
			'commands',
			'publish-poem',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-error-import-rule__',
			relativeFile,
			[
				"import { ForbiddenError } from '@GenericSubdomains/utils/domainError';",
				'',
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function publishPoemFactory(deps: Dependencies) {',
				'\tthrow new ForbiddenError();',
				'}',
			].join('\n'),
			() => {
				const violations = checkInvalidUseCaseErrorImports(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(1);
				expect(violations[0]?.errorName).toBe('ForbiddenError');
			},
		);
	});

	it('ARCHITECTURE-RULE allows the canonical domain error alias', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-error-import-rule__',
			'use-cases',
			'queries',
			'get-feed',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-error-import-rule__',
			relativeFile,
			[
				"import { ForbiddenError } from '@DomainError';",
				'',
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function getFeedFactory(deps: Dependencies) {',
				'\tthrow new ForbiddenError();',
				'}',
			].join('\n'),
			() => {
				const violations = checkInvalidUseCaseErrorImports(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(0);
			},
		);
	});

	it('ARCHITECTURE-RULE flags policy files that import from the internal domain error module', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-error-import-rule__',
			'use-cases',
			'policies',
			'Policies.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-error-import-rule__',
			relativeFile,
			[
				"import { ForbiddenError } from '@GenericSubdomains/utils/domainError';",
				'',
				'export function canDoThing(): void {',
				'\tthrow new ForbiddenError();',
				'}',
			].join('\n'),
			() => {
				const violations = checkInvalidUseCaseErrorImports(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(1);
				expect(violations[0]?.errorName).toBe('ForbiddenError');
			},
		);
	});
});
