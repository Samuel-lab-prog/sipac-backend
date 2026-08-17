import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { givenResolved } from '@GenericSubdomains/utils/testing/utils';
import type { FriendRequestsByUser } from '../../ports/models';
import type { QueriesRepository } from '../../ports/queries';
import {
	DEFAULT_ADDRESSEE_ID,
	DEFAULT_BLOCKED_RELATIONSHIP_ID,
	DEFAULT_FRIEND_REQUEST_ID,
	DEFAULT_FRIENDSHIP_ID,
	DEFAULT_NICKNAME,
	DEFAULT_REQUESTER_ID,
} from './Constants';
import type { FriendsManagementSutMocks } from './SutMocks';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectUserBasicInfo']>>
>;

export type FriendRequestOverride = Partial<
	NonNullable<Awaited<ReturnType<QueriesRepository['findFriendRequest']>>>
>;

export type FriendshipOverride = Partial<
	NonNullable<
		Awaited<ReturnType<QueriesRepository['findFriendshipBetweenUsers']>>
	>
>;

export type BlockedRelationshipOverride = Partial<
	NonNullable<Awaited<ReturnType<QueriesRepository['findBlockedRelationship']>>>
>;

export type FriendRequestsByUserOverride = Partial<FriendRequestsByUser>;

export function givenAddressee(
	usersContract: FriendsManagementSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(usersContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_ADDRESSEE_ID,
		status: 'active',
		role: 'author',
		nickname: DEFAULT_NICKNAME,
		...overrides,
	});
}

export function givenNoFriendship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'findFriendshipBetweenUsers', null);
}

export function givenFriendship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: FriendshipOverride = {},
) {
	givenResolved(queriesRepository, 'findFriendshipBetweenUsers', {
		id: DEFAULT_FRIENDSHIP_ID,
		userAId: DEFAULT_REQUESTER_ID,
		userBId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenNoBlockedRelationship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'findBlockedRelationship', null);
}

export function givenBlockedRelationship(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: BlockedRelationshipOverride = {},
) {
	givenResolved(queriesRepository, 'findBlockedRelationship', {
		id: DEFAULT_BLOCKED_RELATIONSHIP_ID,
		blockedById: DEFAULT_REQUESTER_ID,
		blockedUserId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenNoFriendRequest(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'findFriendRequest', null);
}

export function givenFriendRequest(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: FriendRequestOverride = {},
) {
	givenResolved(queriesRepository, 'findFriendRequest', {
		id: DEFAULT_FRIEND_REQUEST_ID,
		requesterId: DEFAULT_REQUESTER_ID,
		addresseeId: DEFAULT_ADDRESSEE_ID,
		createdAt: new Date(),
		...overrides,
	});
}

export function givenFriendRequestLookup(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	{
		outgoing,
		incoming,
	}: {
		outgoing: FriendRequestOverride | null;
		incoming: FriendRequestOverride | null;
	},
) {
	// eslint-disable-next-line require-await
	queriesRepository.findFriendRequest.mockImplementation(async (params) => {
		if (
			params.requesterId === DEFAULT_REQUESTER_ID &&
			params.addresseeId === DEFAULT_ADDRESSEE_ID
		) {
			if (!outgoing) return null;
			return {
				id: DEFAULT_FRIEND_REQUEST_ID,
				requesterId: DEFAULT_REQUESTER_ID,
				addresseeId: DEFAULT_ADDRESSEE_ID,
				createdAt: new Date(),
				...outgoing,
			};
		}

		if (
			params.requesterId === DEFAULT_ADDRESSEE_ID &&
			params.addresseeId === DEFAULT_REQUESTER_ID
		) {
			if (!incoming) return null;
			return {
				id: DEFAULT_FRIEND_REQUEST_ID,
				requesterId: DEFAULT_ADDRESSEE_ID,
				addresseeId: DEFAULT_REQUESTER_ID,
				createdAt: new Date(),
				...incoming,
			};
		}

		return null;
	});
}

export function givenFriendRequestsByUser(
	queriesRepository: FriendsManagementSutMocks['queriesRepository'],
	overrides: FriendRequestsByUserOverride = {},
) {
	givenResolved(queriesRepository, 'selectFriendRequestsByUser', {
		sent: [],
		received: [],
		...overrides,
	});
}

export function givenCreatedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'createFriendRequest', {
		ok: true,
		data: {
			id: DEFAULT_FRIEND_REQUEST_ID,
			requesterId: DEFAULT_REQUESTER_ID,
			addresseeId: DEFAULT_ADDRESSEE_ID,
			createdAt: new Date(),
		},
	});
}

export function givenAcceptedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'acceptFriendRequest', {
		ok: true,
		data: {
			id: DEFAULT_FRIENDSHIP_ID,
			userAId: DEFAULT_REQUESTER_ID,
			userBId: DEFAULT_ADDRESSEE_ID,
			createdAt: new Date(),
		},
	});
}

export function givenRejectedFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'rejectFriendRequest', {
		ok: true,
		data: {
			rejecterId: DEFAULT_REQUESTER_ID,
			rejectedId: DEFAULT_ADDRESSEE_ID,
		},
	});
}

export function givenCancelledFriendRequest(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'cancelFriendRequest', {
		ok: true,
		data: {
			cancellerId: DEFAULT_REQUESTER_ID,
			cancelledId: DEFAULT_ADDRESSEE_ID,
		},
	});
}

export function givenDeletedFriend(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deleteFriend', {
		ok: true,
		data: {
			removedById: DEFAULT_REQUESTER_ID,
			removedId: DEFAULT_ADDRESSEE_ID,
		},
	});
}

export function givenBlockedUser(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'blockUser', {
		ok: true,
		data: {
			id: DEFAULT_BLOCKED_RELATIONSHIP_ID,
			blockedById: DEFAULT_REQUESTER_ID,
			blockedUserId: DEFAULT_ADDRESSEE_ID,
			createdAt: new Date(),
		},
	});
}

export function givenUnblockedUser(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'unblockUser', {
		ok: true,
		data: {
			unblockerId: DEFAULT_REQUESTER_ID,
			unblockedId: DEFAULT_ADDRESSEE_ID,
		},
	});
}

export function givenDeletedFriendRequestIfExists(
	commandsRepository: FriendsManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deleteFriendRequestIfExists', {
		ok: true,
		data: undefined,
	});
}
