import { describe, expect, it } from 'bun:test';
import { makeClocResult } from '../../test-helpers/fixtures';
import { checkMissingDirectories } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Directory Structure', () => {
	it('ARCHITECTURE-RULE reports missing folders for domains and ignores generic-subdomains', () => {
		const cloc = makeClocResult({
			'src/domains/poems-management/use-cases/commands/create-poem/execute.ts':
				{
					code: 10,
				},
			'src/domains/poems-management/ports/models.ts': {
				code: 8,
			},
			'src/generic-subdomains/persistance/prisma/schema.ts': {
				code: 12,
			},
			'src/generic-subdomains/utils/app-error/index.ts': {
				code: 6,
			},
		});

		const violations = checkMissingDirectories(cloc);

		expect(violations).toEqual([
			{
				domain: 'poems-management',
				path: 'src/domains/poems-management',
				missingFolders: ['adapters'],
			},
		]);
	});

	it('ARCHITECTURE-RULE accepts domains that expose all required folders', () => {
		const cloc = makeClocResult({
			'src/domains/notifications/use-cases/commands/create-notification/execute.ts':
				{
					code: 10,
				},
			'src/domains/notifications/ports/models.ts': {
				code: 8,
			},
			'src/domains/notifications/adapters/EmailNotifier.ts': {
				code: 12,
			},
		});

		const violations = checkMissingDirectories(cloc);

		expect(violations).toHaveLength(0);
	});
});
