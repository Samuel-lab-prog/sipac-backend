import { ConflictError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Unblock User', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeUnblockUser({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Does not allow unblocking when relationship does not exist', async () => {
			const scenario =
				makeFriendsManagementScenario().withNoBlockedRelationship();

			await expectError(scenario.executeUnblockUser(), NotFoundError);
		});

		it('Should unblock the user and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withBlockedRelationship()
				.withUnblockedUser();

			const result = await scenario.executeUnblockUser();

			expect(result).toHaveProperty('unblockerId', 1);
			expect(result).toHaveProperty('unblockedId', 2);
		});
	});
});
