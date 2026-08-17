import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkInvalidDirectionalDependencies } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Directional Dependencies', () => {
	it('ARCHITECTURE-RULE flags use-cases depending on adapters and allows forward dependencies', () => {
		const cruiseResult = makeDepcruiseResult([
			{
				source:
					'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				dependencies: [
					{
						resolved: 'src/domains/poems-management/adapters/PoemRouter.ts',
					},
					{
						resolved: 'src/domains/poems-management/domain/Poem.ts',
					},
				],
			},
		]);

		expect(checkInvalidDirectionalDependencies(cruiseResult)).toEqual([
			{
				from: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
				to: 'src/domains/poems-management/adapters/PoemRouter.ts',
				fromLayer: 'use-cases',
				toLayer: 'adapters',
			},
		]);
	});
});
