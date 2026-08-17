import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkInvalidPortsContent } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Ports Content', () => {
	it('ARCHITECTURE-RULE flags invalid ports files and folders', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/ports/bad.ts': { code: 10 },
			'src/domains/poems-management/ports/temp/file.ts': { code: 8 },
			'src/domains/poems-management/ports/schemas/index.ts': { code: 6 },
			'src/domains/poems-management/ports/models.ts': { code: 4 },
		});

		expect(checkInvalidPortsContent(cloc)).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/ports',
				entry: 'bad.ts',
				reason: 'Invalid file name',
			},
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management/ports/temp',
				entry: 'temp',
				reason: 'Invalid ports folder',
			},
		]);
	});
});
