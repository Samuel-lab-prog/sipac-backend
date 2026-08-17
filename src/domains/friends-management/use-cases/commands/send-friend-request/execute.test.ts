import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import {
	DEFAULT_ADDRESSEE_ID,
	DEFAULT_REQUESTER_ID,
} from '../../test-helpers/Constants';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Send Friend Request', () => {
		it('Does not allow self reference', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeSendFriendRequest({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Should abort when users are blocked', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withBlockedRelationship();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should abort when requester is banned', async () => {
			const scenario = makeFriendsManagementScenario();
			scenario.mocks.usersContract.selectUserBasicInfo.mockResolvedValue({
				exists: true,
				id: DEFAULT_REQUESTER_ID,
				status: 'banned',
				role: 'author',
				nickname: 'banned_user',
				avatarUrl: null,
			});

			await expectError(scenario.executeSendFriendRequest(), ForbiddenError);
		});

		it('Should hide banned addressees', async () => {
			const scenario = makeFriendsManagementScenario();
			scenario.mocks.usersContract.selectUserBasicInfo.mockImplementation(
				// eslint-disable-next-line require-await
				async (userId) => ({
					exists: true,
					id: userId,
					status: userId === DEFAULT_ADDRESSEE_ID ? 'banned' : 'active',
					role: 'author',
					nickname: 'test_user',
					avatarUrl: null,
				}),
			);

			await expectError(scenario.executeSendFriendRequest(), NotFoundError);
		});

		it('Should abort when friendship already exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withFriendship();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should abort when outgoing request already exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequest();

			await expectError(scenario.executeSendFriendRequest(), ConflictError);
		});

		it('Should accept request when incoming request exists', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookup({ outgoing: null, incoming: {} })
				.withAcceptedFriendRequest();

			const result = await scenario.executeSendFriendRequest();

			expect(result).toHaveProperty('id');
		});

		it('Should create friend request when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withFriendRequestLookup({ outgoing: null, incoming: null })
				.withCreatedFriendRequest();

			const result = await scenario.executeSendFriendRequest();

			expect(result).toHaveProperty('id');
		});
	});
});
