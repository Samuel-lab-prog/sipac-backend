import { ConflictError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import {
	DEFAULT_ADDRESSEE_ID,
	DEFAULT_REQUESTER_ID,
} from '../../test-helpers/Constants';
import { makeFriendsManagementScenario } from '../../test-helpers/Helper';

describe.concurrent(
	'USE-CASE - Friends Management - AcceptFriendRequest',
	() => {
		describe('Successful execution', () => {
			it('should accept friend request', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withNoFriendship()
					.withNoBlockedRelationship()
					.withFriendRequest()
					.withAcceptedFriendRequest();

				const result = await scenario.executeAcceptFriendRequest();

				expect(result).toHaveProperty('id');
				expect(result).toHaveProperty('userAId', 1);
				expect(result).toHaveProperty('userBId', 2);
			});
		});

		describe('Validation rules', () => {
			it('should throw ConflictError for self reference', async () => {
				const scenario = makeFriendsManagementScenario();

				await expectError(
					scenario.executeAcceptFriendRequest({
						requesterId: 1,
						addresseeId: 1,
					}),
					ConflictError,
				);
			});
		});

		describe('Relationship rules', () => {
			it('should throw ConflictError when friendship already exists', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withFriendship();

				await expectError(scenario.executeAcceptFriendRequest(), ConflictError);
			});

			it('should throw ConflictError when users are blocked', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withNoFriendship()
					.withBlockedRelationship();

				await expectError(scenario.executeAcceptFriendRequest(), ConflictError);
			});

			it('should throw NotFoundError when friend request does not exist', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withNoFriendship()
					.withNoBlockedRelationship()
					.withNoFriendRequest();

				await expectError(scenario.executeAcceptFriendRequest(), NotFoundError);
			});

			it('should throw NotFoundError when requester is banned', async () => {
				const scenario = makeFriendsManagementScenario();
				scenario.mocks.usersContract.selectUserBasicInfo.mockImplementation(
					// eslint-disable-next-line require-await
					async (userId) => ({
						exists: true,
						id: userId,
						status: userId === DEFAULT_REQUESTER_ID ? 'banned' : 'active',
						role: 'author',
						nickname: 'test_user',
						avatarUrl: null,
					}),
				);

				await expectError(scenario.executeAcceptFriendRequest(), NotFoundError);
			});

			it('should throw NotFoundError when addressee is banned', async () => {
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

				await expectError(scenario.executeAcceptFriendRequest(), NotFoundError);
			});
		});

		describe('Repository error mapping', () => {
			it('should throw ConflictError when accept command returns conflict', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withNoFriendship()
					.withNoBlockedRelationship()
					.withFriendRequest();

				scenario.mocks.commandsRepository.acceptFriendRequest.mockResolvedValue(
					{
						ok: false,
						code: 'CONFLICT',
						data: null,

						message: 'friendship already exists',
					},
				);

				await expectError(scenario.executeAcceptFriendRequest(), ConflictError);
			});

			it('should throw NotFoundError when accept command returns not found', async () => {
				const scenario = makeFriendsManagementScenario()
					.withAddressee()
					.withNoFriendship()
					.withNoBlockedRelationship()
					.withFriendRequest();

				scenario.mocks.commandsRepository.acceptFriendRequest.mockResolvedValue(
					{
						ok: false,
						code: 'NOT_FOUND',
						data: null,

						message: 'not found',
					},
				);

				await expectError(scenario.executeAcceptFriendRequest(), NotFoundError);
			});
		});

		describe('Error propagation', () => {
			it('should not swallow dependency errors', async () => {
				const scenario = makeFriendsManagementScenario();
				scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
					new Error('boom'),
				);

				await expectError(scenario.executeAcceptFriendRequest(), Error);
			});
		});
	},
);
