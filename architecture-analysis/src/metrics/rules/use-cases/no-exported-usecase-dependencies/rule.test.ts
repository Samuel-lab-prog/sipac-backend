import { describe, expect, it } from 'bun:test';
import path from 'node:path';
import { makeClocResult } from '../../test-helpers/fixtures';
import { withTemporaryDomainFile } from '../../test-helpers/filesystem';
import { checkExportedUseCaseDependencies } from './rule';

describe('ARCHITECTURE-RULE - No Exported Usecase Dependencies', () => {
	it('ARCHITECTURE-RULE flags exported Dependencies interfaces', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-deps-rule__',
			'use-cases',
			'commands',
			'publish-poem',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-deps-rule__',
			relativeFile,
			[
				'export interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function publishPoemFactory(deps: Dependencies) {',
				'\treturn async function publishPoem() {',
				'\t\treturn deps.service;',
				'\t};',
				'}',
			].join('\n'),
			() => {
				const violations = checkExportedUseCaseDependencies(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(1);
				expect(violations[0]?.declaration).toBe(
					'export interface Dependencies',
				);
			},
		);
	});

	it('ARCHITECTURE-RULE allows local Dependencies types', () => {
		const relativeFile = path.join(
			'src',
			'domains',
			'__tmp-usecase-deps-rule__',
			'use-cases',
			'queries',
			'get-feed',
			'execute.ts',
		);
		withTemporaryDomainFile(
			'__tmp-usecase-deps-rule__',
			relativeFile,
			[
				'interface Dependencies {',
				'\tservice: unknown;',
				'}',
				'',
				'export function getFeedFactory(deps: Dependencies) {',
				'\treturn async function getFeed() {',
				'\t\treturn deps.service;',
				'\t};',
				'}',
			].join('\n'),
			() => {
				const violations = checkExportedUseCaseDependencies(
					makeClocResult({
						[relativeFile]: { code: 1 },
					}),
				);

				expect(violations).toHaveLength(0);
			},
		);
	});
});
