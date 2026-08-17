import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkMissingSchemaBarrels } from './rule';

describe('ARCHITECTURE-RULE - No Missing Schema Barrels', () => {
	it('ARCHITECTURE-RULE flags schemas folders without index.ts', () => {
		const cloc = makeClocResult({
			'src/domains/users-management/ports/schemas/UserSchema.ts': { code: 10 },
			'src/generic-subdomains/authentication/ports/schemas/AuthSchema.ts': {
				code: 12,
			},
		});

		expect(checkMissingSchemaBarrels(cloc)).toEqual([
			{
				domain: 'users-management',
				path: 'src/domains/users-management/ports/schemas',
				missing: 'index.ts',
			},
			{
				domain: 'authentication',
				path: 'src/generic-subdomains/authentication/ports/schemas',
				missing: 'index.ts',
			},
		]);
	});

	it('ARCHITECTURE-RULE allows schemas folders with index.ts', () => {
		const cloc = makeClocResult({
			'src/domains/users-management/ports/schemas/index.ts': { code: 10 },
			'src/domains/users-management/ports/schemas/UserSchema.ts': { code: 12 },
		});

		expect(checkMissingSchemaBarrels(cloc)).toHaveLength(0);
	});
});
