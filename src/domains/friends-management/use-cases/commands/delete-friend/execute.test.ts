import { ConflictError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Delete Friend', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeDeleteFriend({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Does not allow deleting when friendship does not exist', async () => {
			const scenario = makeFriendsManagementScenario().withNoFriendship();

			await expectError(scenario.executeDeleteFriend(), NotFoundError);
		});

		it('Should delete the friend and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withFriendship()
				.withDeletedFriend();

			const result = await scenario.executeDeleteFriend();

			expect(result).toHaveProperty('removedById', 1);
			expect(result).toHaveProperty('removedId', 2);
		});
	});
});
