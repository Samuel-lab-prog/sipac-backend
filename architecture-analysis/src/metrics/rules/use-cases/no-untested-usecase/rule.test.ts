import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkMissingExecuteTests } from './rule';

describe('ARCHITECTURE-RULE - No Untested Usecase', () => {
	it('ARCHITECTURE-RULE flags execute.ts files without execute.test.ts', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 10,
				},
			'src/domains/poems-management/use-cases/commands/create-poem/execute.test.ts':
				{
					code: 8,
				},
			'src/domains/users-management/use-cases/queries/get-user/execute.ts': {
				code: 6,
			},
		});

		expect(checkMissingExecuteTests(cloc)).toEqual([
			{
				domain: 'users-management',
				useCasePath: 'src/domains/users-management/use-cases/queries/get-user',
				executeFile:
					'src/domains/users-management/use-cases/queries/get-user/execute.ts',
			},
		]);
	});
});
