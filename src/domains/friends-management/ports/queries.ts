import type {
	FriendRequestRecord,
	BlockedUserRecord,
	FriendshipRecord,
	FriendRequestsByUser,
} from './models';

export interface QueriesRouterServices {
	getMyFriendRequests(params: {
		requesterId: number;
	}): Promise<FriendRequestsByUser>;
}

export interface QueriesRepository {
	findFriendshipBetweenUsers(params: {
		user1Id: number;
		user2Id: number;
	}): Promise<FriendshipRecord | null>;
	findFriendRequest(params: {
		requesterId: number;
		addresseeId: number;
	}): Promise<FriendRequestRecord | null>;
	findBlockedRelationship(params: {
		userId1: number;
		userId2: number;
	}): Promise<BlockedUserRecord | null>;
	selectFriendRequestsByUser(userId: number): Promise<FriendRequestsByUser>;
}
