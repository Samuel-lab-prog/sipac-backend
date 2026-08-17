import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkInvalidRepositoryFiles } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Repository Files', () => {
	it('ARCHITECTURE-RULE flags missing repository.ts and invalid repository files', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/infra/commands-repository/selects.ts': {
				code: 10,
			},
			'src/domains/poems-management/infra/queries-repository/helpers.ts': {
				code: 8,
			},
			'src/domains/poems-management/infra/queries-repository/temp/extra.ts': {
				code: 6,
			},
		});

		expect(checkInvalidRepositoryFiles(cloc)).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/infra/queries-repository',
				entry: 'temp',
				reason: 'Subdirectories are not allowed',
			},
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/infra/commands-repository',
				entry: 'repository.ts',
				reason: 'Missing repository.ts',
			},
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/infra/queries-repository',
				entry: 'repository.ts',
				reason: 'Missing repository.ts',
			},
		]);
	});
});
