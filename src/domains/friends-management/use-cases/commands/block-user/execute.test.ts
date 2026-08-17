import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Friends Management', () => {
	describe('Block User', () => {
		it('Does not allow self request', async () => {
			const scenario = makeFriendsManagementScenario();

			await expectError(
				scenario.executeBlockUser({ requesterId: 1, addresseeId: 1 }),
				ConflictError,
			);
		});

		it('Prevents blocking if one of the users has already blocked the other', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withBlockedRelationship()
				.withNoFriendship()
				.withNoFriendRequest();

			await expectError(scenario.executeBlockUser(), ConflictError);

			expect(
				scenario.mocks.queriesRepository.findBlockedRelationship,
			).toHaveBeenCalledWith({
				userId1: 1,
				userId2: 2,
			});
		});

		it('Should block the user and return the result when no errors occur', async () => {
			const scenario = makeFriendsManagementScenario()
				.withAddressee()
				.withNoBlockedRelationship()
				.withNoFriendship()
				.withNoFriendRequest()
				.withDeletedFriendRequestIfExists()
				.withBlockedUser();

			const result = await scenario.executeBlockUser();

			expect(result).toHaveProperty('blockedById', 1);
			expect(result).toHaveProperty('blockedUserId', 2);
		});

		it('Should not allow banned users to block users', async () => {
			const scenario = makeFriendsManagementScenario();
			scenario.mocks.usersContract.selectUserBasicInfo.mockImplementation(
				(userId) =>
					Promise.resolve({
						exists: true,
						id: userId,
						status: userId === 1 ? 'banned' : 'active',
						role: 'author',
						nickname: 'user',
						avatarUrl: null,
					}),
			);

			await expectError(scenario.executeBlockUser(), ForbiddenError);

			expect(
				scenario.mocks.commandsRepository.blockUser,
			).not.toHaveBeenCalled();
		});

		it('Should hide banned users from block actions', async () => {
			const scenario = makeFriendsManagementScenario();
			scenario.mocks.usersContract.selectUserBasicInfo.mockImplementation(
				(userId) =>
					Promise.resolve({
						exists: true,
						id: userId,
						status: userId === 2 ? 'banned' : 'active',
						role: 'author',
						nickname: 'user',
						avatarUrl: null,
					}),
			);

			await expectError(scenario.executeBlockUser(), NotFoundError);

			expect(
				scenario.mocks.commandsRepository.blockUser,
			).not.toHaveBeenCalled();
		});
	});
});
