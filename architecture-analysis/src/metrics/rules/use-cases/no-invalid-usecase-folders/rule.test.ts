import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkInvalidUseCaseFolders } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Usecase Folders', () => {
	it('ARCHITECTURE-RULE flags files at use-cases root and invalid folders', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/use-cases/execute.ts': { code: 10 },
			'src/domains/poems-management/use-cases/CreatePoem/execute.ts': {
				code: 8,
			},
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 6,
				},
		});

		expect(checkInvalidUseCaseFolders(cloc)).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/use-cases',
				entry: 'execute.ts',
				reason: 'Files are not allowed at use-cases root',
			},
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/use-cases/CreatePoem',
				entry: 'CreatePoem',
				reason: 'Invalid use-cases folder',
			},
		]);
	});
});
