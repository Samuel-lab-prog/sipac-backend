import { ConflictError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Reject Friend Request', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeRejectFriendRequest({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Does not allow rejecting if the request does not exist', async () => {
			const scenario = makeFriendsManagementScenario().withNoFriendRequest();

			await expectError(scenario.executeRejectFriendRequest(), NotFoundError);
		});

		it('Should reject the friend request and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withFriendRequest()
				.withRejectedFriendRequest();

			const result = await scenario.executeRejectFriendRequest();

			expect(result).toHaveProperty('rejecterId', 1);
			expect(result).toHaveProperty('rejectedId', 2);
		});
	});
});
