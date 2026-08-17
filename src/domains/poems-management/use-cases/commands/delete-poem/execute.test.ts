import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - DeletePoem', () => {
	describe('Successful execution', () => {
		it('should delete a poem', async () => {
			const scenario = makePoemsScenario()
				.withUser({ id: 1 })
				.withPoem({ author: { id: 1 } })
				.withPoemDeleted();

			const result = await scenario.executeDeletePoem({
				poemId: 1,
			});

			expect(result).toBeUndefined();
		});

		it('should call deletePoem with correct params', async () => {
			const scenario = makePoemsScenario()
				.withUser({ id: 1 })
				.withPoem({ author: { id: 1 } })
				.withPoemDeleted();

			await scenario.executeDeletePoem({
				poemId: 1,
			});

			expect(scenario.mocks.commandsRepository.deletePoem).toHaveBeenCalledWith(
				1,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withUser({ id: 1 })
				.withSlug('updated-title');

			scenario.mocks.commandsRepository.deletePoem.mockResolvedValue({
				ok: false,
				error: new Error('boom'),
				data: null,
				code: 'UNKNOWN',
			});

			await expectError(scenario.executeDeletePoem(), Error);
		});

		it('should forbid deleting another author poem', async () => {
			const scenario = makePoemsScenario()
				.withUser({ id: 1 })
				.withPoem({ author: { id: 2 } });

			await expectError(scenario.executeDeletePoem(), Error);
		});

		it('should propagate query dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPoemById.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeDeletePoem(), Error);
		});
	});
});
