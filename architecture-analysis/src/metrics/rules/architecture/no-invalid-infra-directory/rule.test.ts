import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkInvalidInfraDirectory } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Infra Directory', () => {
	it('ARCHITECTURE-RULE flags files at infra root and invalid infra folders', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/infra/execute.ts': { code: 10 },
			'src/domains/poems-management/infra/bad-folder/file.ts': { code: 8 },
			'src/domains/poems-management/infra/commands-repository/repository.ts': {
				code: 6,
			},
		});

		expect(checkInvalidInfraDirectory(cloc)).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/infra',
				entry: 'execute.ts',
				reason: 'Files are not allowed at infra root',
			},
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/infra/bad-folder',
				entry: 'bad-folder',
				reason: 'Invalid infra folder',
			},
		]);
	});
});
