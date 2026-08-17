import {
	BlockedUserSchema,
	FriendRecordSchema,
	FriendRequestSchema,
	FriendRequestRejectionSchema,
	UnblockUserSchema,
	CancelFriendRequestSchema,
	RemovedFriendSchema,
	FriendRequestsByUserSchema,
} from '../ports/schemas/Index';

export type FriendshipRecord = (typeof FriendRecordSchema)['static'];
export type FriendRequestRecord = (typeof FriendRequestSchema)['static'];
export type BlockedUserRecord = (typeof BlockedUserSchema)['static'];
export type UnblockUserRecord = (typeof UnblockUserSchema)['static'];
export type FriendRequestRejectionRecord =
	(typeof FriendRequestRejectionSchema)['static'];
export type CancelFriendRequestRecord =
	(typeof CancelFriendRequestSchema)['static'];

export type RemovedFriendRecord = (typeof RemovedFriendSchema)['static'];
export type FriendRequestsByUser =
	(typeof FriendRequestsByUserSchema)['static'];
