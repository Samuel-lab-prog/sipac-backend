import type {
	FriendshipRecord,
	FriendRequestRecord,
	CancelFriendRequestRecord,
	FriendRequestRejectionRecord,
	UnblockUserRecord,
	BlockedUserRecord,
	RemovedFriendRecord,
} from './models';

import type { CommandResult } from '@SharedKernel/Types';

export type AcceptFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type BlockUserParams = {
	requesterId: number;
	addresseeId: number;
};

export type CancelFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type DeleteFriendParams = {
	requesterId: number;
	addresseeId: number;
};

export type RejectFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type SendFriendRequestParams = {
	requesterId: number;
	addresseeId: number;
};

export type UnblockUserParams = {
	requesterId: number;
	addresseeId: number;
};

export interface CommandsRepository {
	createFriendRequest(
		requesterId: number,
		addresseeId: number,
	): Promise<CommandResult<FriendRequestRecord>>;

	rejectFriendRequest(
		rejecterId: number,
		rejectedId: number,
	): Promise<CommandResult<FriendRequestRejectionRecord>>;

	acceptFriendRequest(
		accepterId: number,
		accepteeId: number,
	): Promise<CommandResult<FriendshipRecord>>;

	cancelFriendRequest(
		cancellerId: number,
		cancelledId: number,
	): Promise<CommandResult<CancelFriendRequestRecord>>;

	blockUser(
		blockerId: number,
		blockedId: number,
	): Promise<CommandResult<BlockedUserRecord>>;

	unblockUser(
		unblockerId: number,
		unblockedId: number,
	): Promise<CommandResult<UnblockUserRecord>>;

	deleteFriend(
		user1Id: number,
		user2Id: number,
	): Promise<CommandResult<RemovedFriendRecord>>;

	deleteFriendRequestIfExists(
		requesterId: number,
		addresseeId: number,
	): Promise<CommandResult<void>>;
}

export interface CommandsRouterServices {
	sendFriendRequest(
		params: SendFriendRequestParams,
	): Promise<FriendRequestRecord | FriendshipRecord>;
	acceptFriendRequest(
		params: AcceptFriendRequestParams,
	): Promise<FriendshipRecord>;
	rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequestRejectionRecord>;
	blockUser(params: BlockUserParams): Promise<BlockedUserRecord>;
	deleteFriend(params: DeleteFriendParams): Promise<RemovedFriendRecord>;
	cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<CancelFriendRequestRecord>;
	unblockUser(params: UnblockUserParams): Promise<UnblockUserRecord>;
}
