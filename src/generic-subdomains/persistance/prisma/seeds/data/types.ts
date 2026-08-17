import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '@SharedKernel/Enums';

export type UserNickname = string;
export type PoemKey = string;
export type CommentKey = string;

export type SeedUser = {
	email: string;
	name: string;
	nickname: UserNickname;
	bio: string;
	avatarUrl: string;
	createdAt: string;
	emailVerifiedAt: string;
};

export type SeedPoem = {
	key: PoemKey;
	authorNickname: UserNickname;
	title: string;
	content: string;
	tags: string[];
	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	rejectionReason?: string;
	isCommentable?: boolean;
	createdAt: string;
};

export type CommentSeed = {
	key: CommentKey;
	poemKey: PoemKey;
	authorNickname: UserNickname;
	content: string;
	createdAt: string;
	likesFrom?: UserNickname[];
};

export type FriendshipSeed = {
	userA: UserNickname;
	userB: UserNickname;
	createdAt: string;
};

export type FriendRequestSeed = {
	requester: UserNickname;
	addressee: UserNickname;
	createdAt: string;
};

export type PoemLikeSeed = {
	poemKey: PoemKey;
	userNicknames: UserNickname[];
};

export type SavedPoemSeed = {
	userNickname: UserNickname;
	poemKey: PoemKey;
	createdAt: string;
};

export type CollectionSeed = {
	ownerNickname: UserNickname;
	name: string;
	description: string;
	poemKeys: PoemKey[];
};

export type DedicationSeed = {
	poemKey: PoemKey;
	toUserNickname: UserNickname;
	createdAt: string;
};

export type NotificationType =
	| 'NEW_FRIEND'
	| 'NEW_FRIEND_REQUEST'
	| 'POEM_LIKED'
	| 'POEM_COMMENT_CREATED'
	| 'POEM_COMMENT_REPLIED'
	| 'POEM_DEDICATED'
	| 'USER_MENTION_IN_POEM'
	| 'POEM_APPROVED'
	| 'POEM_REJECTED'
	| 'POEM_REMOVED';

export type NotificationEntity =
	| { type: 'POEM'; poemKey: PoemKey }
	| { type: 'COMMENT'; commentKey: CommentKey }
	| { type: 'USER'; userNickname: UserNickname };

export type NotificationSeed = {
	recipientNickname: UserNickname;
	type: NotificationType;
	actorNickname?: UserNickname;
	entity: NotificationEntity;
	aggregatedCount?: number;
	data: Record<string, unknown>;
	createdAt: string;
	readAt?: string;
};
