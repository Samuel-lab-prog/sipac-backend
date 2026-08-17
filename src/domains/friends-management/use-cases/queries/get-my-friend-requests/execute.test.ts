import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management - GetMyFriendRequests', () => {
	it('should return friend requests from repository', async () => {
		const expected = {
			sent: [
				{
					addresseeId: 2,
					addresseeName: 'Ana',
					addresseeNickname: 'ana',
					addresseeAvatarUrl: null,
				},
			],
			received: [
				{
					requesterId: 3,
					requesterName: 'Leo',
					requesterNickname: 'leo',
					requesterAvatarUrl: 'https://cdn.example.com/avatar.png',
				},
			],
		};

		const scenario =
			makeFriendsManagementScenario().withFriendRequestsByUser(expected);

		await expect(scenario.executeGetMyFriendRequests()).resolves.toEqual(
			expected,
		);
	});

	it('should forward requester id to repository', async () => {
		const scenario = makeFriendsManagementScenario().withFriendRequestsByUser({
			sent: [],
			received: [],
		});

		await scenario.executeGetMyFriendRequests({ requesterId: 10 });

		expect(
			scenario.mocks.queriesRepository.selectFriendRequestsByUser,
		).toHaveBeenCalledWith(10);
	});

	it('should not swallow dependency errors', async () => {
		const scenario = makeFriendsManagementScenario();
		scenario.mocks.queriesRepository.selectFriendRequestsByUser.mockRejectedValue(
			new Error('boom'),
		);

		await expectError(
			scenario.executeGetMyFriendRequests({ requesterId: 1 }),
			Error,
		);
	});
});
