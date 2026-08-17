import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - GetProfile', () => {
	describe('Successful execution', () => {
		it('should return private profile', async () => {
			const scenario = makeUsersManagementScenario().withProfile();

			const result = await scenario.executeGetProfile();

			expect(result).toHaveProperty('id', 1);
			expect(result).toHaveProperty('email');
		});

		it('should enrich public profile with relation info', async () => {
			const scenario = makeUsersManagementScenario()
				.withPublicProfile()
				.withRelation({ requestSentByUserId: 1, friends: false });

			const result = await scenario.executeGetProfile({ id: 2 });

			expect(result).toHaveProperty('isFriendRequester', true);
			expect(result).toHaveProperty('hasIncomingFriendRequest', false);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when requester is banned', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
		});

		it('should not query repository when requester is banned (fail fast)', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeGetProfile({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
			expect(
				scenario.mocks.queriesRepository.selectProfile,
			).not.toHaveBeenCalled();
		});

		it('should hide banned public profiles from regular users', async () => {
			const scenario = makeUsersManagementScenario().withPublicProfile({
				status: 'banned',
			});

			await expectError(scenario.executeGetProfile({ id: 2 }), NotFoundError);
			expect(
				scenario.mocks.friendsContract.selectRelation,
			).not.toHaveBeenCalled();
		});

		it('should allow active moderators to view banned public profiles', async () => {
			const scenario = makeUsersManagementScenario().withPublicProfile({
				status: 'banned',
				isFriend: true,
				isFriendRequester: true,
				hasIncomingFriendRequest: true,
			});

			const result = await scenario.executeGetProfile({
				id: 2,
				requesterRole: 'moderator',
			});

			expect(result).toHaveProperty('status', 'banned');
			expect(result).toHaveProperty('isFriend', false);
			expect(result).toHaveProperty('isFriendRequester', false);
			expect(result).toHaveProperty('hasIncomingFriendRequest', false);
			expect(
				scenario.mocks.friendsContract.selectRelation,
			).not.toHaveBeenCalled();
		});
	});

	describe('Profile validation', () => {
		it('should throw NotFoundError when profile does not exist', async () => {
			const scenario = makeUsersManagementScenario().withProfileNotFound();

			await expectError(scenario.executeGetProfile(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.queriesRepository.selectProfile.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeGetProfile(), Error);
		});
	});
});
