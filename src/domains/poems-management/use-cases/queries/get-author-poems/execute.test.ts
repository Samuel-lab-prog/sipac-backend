import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - GetAuthorPoems', () => {
	describe('Successful execution', () => {
		it('should list poems visible to requester', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([
				{},
				{ visibility: 'private' },
			]);

			const result = await scenario.executeGetAuthorPoems({
				authorId: 2,
				requesterId: 10,
				requesterStatus: 'active',
				requesterRole: 'author',
			});

			expect(result).toHaveLength(1);
		});

		it('should allow author to see all their poems', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([
				{ author: { id: 7 }, visibility: 'private', status: 'draft' },
				{ author: { id: 7 }, moderationStatus: 'removed' },
			]);

			const result = await scenario.executeGetAuthorPoems({
				authorId: 7,
				requesterId: 7,
			});

			expect(result).toHaveLength(2);
		});
	});

	describe('Visibility rules', () => {
		it('should hide unlisted poems when access is not direct', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([
				{ visibility: 'unlisted' },
			]);

			const result = await scenario.executeGetAuthorPoems({
				authorId: 2,
				requesterId: 10,
			});

			expect(result).toHaveLength(0);
		});

		it('should show friends-only poems only to friends', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([
				{ visibility: 'friends', author: { id: 2, friendIds: [10] } },
			]);

			const result = await scenario.executeGetAuthorPoems({
				authorId: 2,
				requesterId: 10,
			});

			expect(result).toHaveLength(1);
		});

		it('should hide all poems for banned viewers', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([{}, {}]);

			const result = await scenario.executeGetAuthorPoems({
				authorId: 2,
				requesterId: 10,
				requesterStatus: 'banned',
			});

			expect(result).toHaveLength(0);
		});
	});

	describe('Query forwarding', () => {
		it('should forward author id to repository', async () => {
			const scenario = makePoemsScenario().withAuthorPoems([]);

			await scenario.executeGetAuthorPoems({ authorId: 123 });

			expect(
				scenario.mocks.queriesRepository.selectAuthorPoems,
			).toHaveBeenCalledWith(123);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectAuthorPoems.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeGetAuthorPoems({ authorId: 1 }), Error);
		});
	});
});
