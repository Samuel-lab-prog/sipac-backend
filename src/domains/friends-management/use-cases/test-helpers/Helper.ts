/* eslint-disable max-lines-per-function */
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type {
	AcceptFriendRequestParams,
	BlockUserParams,
	CancelFriendRequestParams,
	DeleteFriendParams,
	RejectFriendRequestParams,
	SendFriendRequestParams,
	UnblockUserParams,
} from '../../ports/commands';
import { DEFAULT_ADDRESSEE_ID, DEFAULT_REQUESTER_ID } from './Constants';
import {
	givenAcceptedFriendRequest,
	givenAddressee,
	givenBlockedRelationship,
	givenBlockedUser,
	givenCancelledFriendRequest,
	givenCreatedFriendRequest,
	givenDeletedFriend,
	givenDeletedFriendRequestIfExists,
	givenFriendRequest,
	givenFriendRequestLookup,
	givenFriendRequestsByUser,
	givenFriendship,
	givenNoBlockedRelationship,
	givenNoFriendRequest,
	givenNoFriendship,
	givenRejectedFriendRequest,
	givenUnblockedUser,
	type BlockedRelationshipOverride,
	type FriendRequestOverride,
	type FriendRequestsByUserOverride,
	type FriendshipOverride,
	type UserBasicInfoOverride,
} from './Givens';
import {
	friendsManagementFactory,
	friendsManagementMockFactories,
	type FriendsManagementSutMocks,
} from './SutMocks';

export function makeFriendsManagementScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		friendsManagementFactory,
		friendsManagementMockFactories(),
	);

	return {
		withAddressee(overrides: UserBasicInfoOverride = {}) {
			givenAddressee(mocks.usersContract, overrides);
			return this;
		},

		withNoFriendship() {
			givenNoFriendship(mocks.queriesRepository);
			return this;
		},

		withFriendship(overrides: FriendshipOverride = {}) {
			givenFriendship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoBlockedRelationship() {
			givenNoBlockedRelationship(mocks.queriesRepository);
			return this;
		},

		withBlockedRelationship(overrides: BlockedRelationshipOverride = {}) {
			givenBlockedRelationship(mocks.queriesRepository, overrides);
			return this;
		},

		withNoFriendRequest() {
			givenNoFriendRequest(mocks.queriesRepository);
			return this;
		},

		withFriendRequest(overrides: FriendRequestOverride = {}) {
			givenFriendRequest(mocks.queriesRepository, overrides);
			return this;
		},

		withFriendRequestLookup(options: {
			outgoing: FriendRequestOverride | null;
			incoming: FriendRequestOverride | null;
		}) {
			givenFriendRequestLookup(mocks.queriesRepository, options);
			return this;
		},

		withFriendRequestsByUser(overrides: FriendRequestsByUserOverride = {}) {
			givenFriendRequestsByUser(mocks.queriesRepository, overrides);
			return this;
		},

		withCreatedFriendRequest() {
			givenCreatedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withAcceptedFriendRequest() {
			givenAcceptedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withRejectedFriendRequest() {
			givenRejectedFriendRequest(mocks.commandsRepository);
			return this;
		},

		withCancelledFriendRequest() {
			givenCancelledFriendRequest(mocks.commandsRepository);
			return this;
		},

		withDeletedFriend() {
			givenDeletedFriend(mocks.commandsRepository);
			return this;
		},

		withBlockedUser() {
			givenBlockedUser(mocks.commandsRepository);
			return this;
		},

		withUnblockedUser() {
			givenUnblockedUser(mocks.commandsRepository);
			return this;
		},

		withDeletedFriendRequestIfExists() {
			givenDeletedFriendRequestIfExists(mocks.commandsRepository);
			return this;
		},

		executeSendFriendRequest(params: Partial<SendFriendRequestParams> = {}) {
			return sutFactory.sendFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeAcceptFriendRequest(
			params: Partial<AcceptFriendRequestParams> = {},
		) {
			return sutFactory.acceptFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeRejectFriendRequest(
			params: Partial<RejectFriendRequestParams> = {},
		) {
			return sutFactory.rejectFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeCancelFriendRequest(
			params: Partial<CancelFriendRequestParams> = {},
		) {
			return sutFactory.cancelFriendRequest(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeDeleteFriend(params: Partial<DeleteFriendParams> = {}) {
			return sutFactory.deleteFriend(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeBlockUser(params: Partial<BlockUserParams> = {}) {
			return sutFactory.blockUser(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeUnblockUser(params: Partial<UnblockUserParams> = {}) {
			return sutFactory.unblockUser(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						addresseeId: DEFAULT_ADDRESSEE_ID,
					},
					params,
				),
			);
		},

		executeGetMyFriendRequests(params: Partial<{ requesterId: number }> = {}) {
			return sutFactory.getMyFriendRequests(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
					},
					params,
				),
			);
		},

		get mocks(): FriendsManagementSutMocks {
			return mocks;
		},
	};
}
