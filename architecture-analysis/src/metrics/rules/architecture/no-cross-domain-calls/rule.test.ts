import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkDomainNamespaceIntegrity } from './rule';

describe('ARCHITECTURE-RULE - No Cross Domain Calls', () => {
	it('ARCHITECTURE-RULE flags cross-domain calls but ignores public and generic paths', () => {
		const cruiseResult = makeDepcruiseResult([
			{
				source:
					'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				dependencies: [
					{
						resolved:
							'src/domains/users-management/use-cases/queries/get-user/execute.ts',
					},
					{
						resolved: 'src/domains/users-management/public/Index.ts',
					},
					{
						resolved: 'src/generic-subdomains/persistance/prisma/client.ts',
					},
				],
			},
		]);

		expect(checkDomainNamespaceIntegrity(cruiseResult)).toEqual([
			{
				from: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				to: 'src/domains/users-management/use-cases/queries/get-user/execute.ts',
				fromDomain: 'poems-management',
				toDomain: 'users-management',
			},
		]);
	});
});
