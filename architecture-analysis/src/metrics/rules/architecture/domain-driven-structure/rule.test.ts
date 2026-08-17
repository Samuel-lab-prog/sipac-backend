import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkDomainDrivenStructure } from './rule';

describe('ARCHITECTURE-RULE - Domain Driven Structure', () => {
	it('ARCHITECTURE-RULE flags files outside allowed namespaces', () => {
		const cloc = makeClocResult({
			'src/experimental/feature.ts': { code: 10 },
			'src/Server.ts': { code: 5 },
		});

		expect(checkDomainDrivenStructure(cloc)).toEqual([
			{
				path: 'src/experimental/feature.ts',
				root: 'experimental',
				reason: 'Unknown architectural namespace',
			},
		]);
	});

	it('ARCHITECTURE-RULE allows valid domain and bootstrap files', () => {
		const cloc = makeClocResult({
			'src/Server.ts': { code: 5 },
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 10,
				},
			'src/shared-kernel/Enums.ts': { code: 8 },
		});

		expect(checkDomainDrivenStructure(cloc)).toHaveLength(0);
	});
});
