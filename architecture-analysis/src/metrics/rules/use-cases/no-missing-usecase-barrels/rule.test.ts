import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkMissingUseCaseBarrels } from './rule';

describe('ARCHITECTURE-RULE - No Missing Usecase Barrels', () => {
	it('ARCHITECTURE-RULE flags commands and queries folders without index.ts', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 10,
				},
			'src/generic-subdomains/authentication/use-cases/queries/refresh/execute.ts':
				{
					code: 12,
				},
		});

		expect(checkMissingUseCaseBarrels(cloc)).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/use-cases/commands',
				folder: 'commands',
				missing: 'index.ts',
			},
			{
				domain: 'authentication',
				path: 'src/generic-subdomains/authentication/use-cases/queries',
				folder: 'queries',
				missing: 'index.ts',
			},
		]);
	});

	it('ARCHITECTURE-RULE allows use-case folders with index.ts', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/use-cases/commands/index.ts': { code: 10 },
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 12,
				},
		});

		expect(checkMissingUseCaseBarrels(cloc)).toHaveLength(0);
	});
});
