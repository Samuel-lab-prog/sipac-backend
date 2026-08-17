import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - GetMyPoems', () => {
	describe('Successful execution', () => {
		it('should return all poems belonging to requester', async () => {
			const scenario = makePoemsScenario().withMyPoems([
				{ visibility: 'private', status: 'draft', moderationStatus: 'removed' },
				{
					visibility: 'public',
					status: 'published',
					moderationStatus: 'approved',
				},
			]);

			const result = await scenario.executeGetMyPoems({ requesterId: 1 });

			expect(result).toHaveLength(2);
		});
	});

	describe('Query forwarding', () => {
		it('should forward requester id to repository', async () => {
			const scenario = makePoemsScenario().withMyPoems([]);

			await scenario.executeGetMyPoems({ requesterId: 10 });

			expect(
				scenario.mocks.queriesRepository.selectMyPoems,
			).toHaveBeenCalledWith(10);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectMyPoems.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeGetMyPoems({ requesterId: 1 }), Error);
		});
	});
});
