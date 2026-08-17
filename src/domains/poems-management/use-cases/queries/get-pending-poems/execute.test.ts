import { ForbiddenError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - GetPendingPoems', () => {
	describe('Successful execution', () => {
		it('should return pending poems', async () => {
			const scenario = makePoemsScenario().withPendingPoems([{}, {}]);

			const result = await scenario.executeGetPendingPoems({
				navigationOptions: { limit: 10, cursor: 0 },
			});

			expect(result).toHaveLength(2);
		});
	});

	describe('Permissions', () => {
		it('should throw ForbiddenError when requester is not moderator/admin', async () => {
			const scenario = makePoemsScenario();

			await expectError(
				scenario.executeGetPendingPoems({
					requesterRole: 'author',
					navigationOptions: { limit: 10, cursor: 0 },
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError when requester is not active', async () => {
			const scenario = makePoemsScenario();

			await expectError(
				scenario.executeGetPendingPoems({
					requesterStatus: 'banned',
					navigationOptions: { limit: 10, cursor: 0 },
				}),
				ForbiddenError,
			);
		});
	});

	describe('Query forwarding', () => {
		it('should clamp limit to max value', async () => {
			const scenario = makePoemsScenario().withPendingPoems();

			await scenario.executeGetPendingPoems({
				navigationOptions: { limit: 999, cursor: 5 },
			});

			expect(
				scenario.mocks.queriesRepository.selectPendingPoems,
			).toHaveBeenCalledWith({
				navigationOptions: { limit: 100, cursor: 5 },
			});
		});

		it('should use default limit when not provided', async () => {
			const scenario = makePoemsScenario().withPendingPoems();

			await scenario.executeGetPendingPoems({
				navigationOptions: { cursor: 12 },
			});

			expect(
				scenario.mocks.queriesRepository.selectPendingPoems,
			).toHaveBeenCalledWith({
				navigationOptions: { limit: 20, cursor: 12 },
			});
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPendingPoems.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(
				scenario.executeGetPendingPoems({
					navigationOptions: { limit: 10, cursor: 0 },
				}),
				Error,
			);
		});
	});
});
