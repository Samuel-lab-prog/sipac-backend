import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkCircularDependencies } from './rule';

describe('ARCHITECTURE-RULE - No Circular Dependencies', () => {
	it('ARCHITECTURE-RULE reports one circular dependency and ignores generated prisma cycles', () => {
		const regularCycle = [
			{
				name: 'src/domains/users-management/use-cases/queries/get-user/execute.ts',
			},
			{
				name: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
			},
		];
		const generatedCycle = [
			{ name: 'src/generic-subdomains/persistance/prisma/generated/client.ts' },
			{
				name: 'src/generic-subdomains/persistance/prisma/generated/runtime.ts',
			},
		];

		const cruiseResult = makeDepcruiseResult(
			[
				{
					source:
						'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
					dependencies: [
						{
							resolved:
								'src/domains/users-management/use-cases/queries/get-user/execute.ts',
							circular: true,
							cycle: regularCycle,
						},
					],
				},
				{
					source:
						'src/generic-subdomains/persistance/prisma/generated/client.ts',
					dependencies: [
						{
							resolved:
								'src/generic-subdomains/persistance/prisma/generated/runtime.ts',
							circular: true,
							cycle: generatedCycle,
						},
					],
				},
			],
			[
				{
					from: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
					to: 'src/domains/users-management/use-cases/queries/get-user/execute.ts',
					rule: { name: 'no-circular' },
					cycle: regularCycle,
				},
			],
		);

		expect(checkCircularDependencies(cruiseResult)).toEqual([
			{
				from: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				to: 'src/domains/users-management/use-cases/queries/get-user/execute.ts',
				length: 2,
				cycle:
					'src/domains/poems-management/use-cases/commands/create-poem/execute.ts -> src/domains/users-management/use-cases/queries/get-user/execute.ts -> src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
			},
		]);
	});
});
