/* eslint-disable max-lines */
import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import { canViewPoem } from '../use-cases/policies/Policies';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import {
	isBannedUser,
	publicUserRelationFilter,
} from '@SharedKernel/policies/BannedUserVisibility';

export type UserProfilePoem = {
	id: number;
	title: string;
	slug: string;
	createdAt: Date;
	likesCount: number;
	commentsCount: number;
	tags: Array<{
		id: number;
		name: string;
	}>;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string | null;
	};
};

export type UserPrivateProfileView = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: UserRole;
	status: UserStatus;
	email: string;
	emailVerifiedAt: Date | null;
	unreadNotificationsCount: number;
	poems: UserProfilePoem[];
	stats: {
		poems: Array<{ id: number; title: string }>;
		commentsIds: number[];
		friends: Array<{ id: number }>;
	};
	blockedUsersIds: number[];
};

export type UserPublicProfileView = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: UserRole;
	status: UserStatus;
	poems: UserProfilePoem[];
	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};
	isFriend: boolean;
	hasBlockedRequester: boolean;
	isBlockedByRequester: boolean;
	isFriendRequester: boolean;
	hasIncomingFriendRequest: boolean;
};

export type ProfileViewer = {
	id?: number;
	role?: string;
	status?: string;
};

function normalizeAvatarUrl(
	avatarUrl: string | null | undefined,
): string | null {
	if (!avatarUrl) return null;

	const trimmed = avatarUrl.trim();
	return trimmed.length > 0 ? trimmed : null;
}

const publicPoemEngagementCountSelect = {
	poemLikes: {
		where: {
			user: publicUserRelationFilter,
		},
	},
	comments: {
		where: {
			author: publicUserRelationFilter,
		},
	},
} as const;

export const privateProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,
	email: true,
	emailVerifiedAt: true,
	notifications: {
		where: { readAt: null },
		select: { id: true },
	},

	poems: {
		where: { deletedAt: null },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			status: true,
			visibility: true,
			moderationStatus: true,
			_count: {
				select: publicPoemEngagementCountSelect,
			},
			tags: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
	comments: { select: { id: true } },
	friendshipsFrom: {
		select: {
			userBId: true,
			userB: {
				select: {
					status: true,
				},
			},
		},
	},

	friendshipsTo: {
		select: {
			userAId: true,
			userA: {
				select: {
					status: true,
				},
			},
		},
	},

	blockedUsers: { select: { blockedId: true } },
} as const satisfies UserSelect;

type PrivateProfileRaw = Prisma.UserGetPayload<{
	select: typeof privateProfileSelect;
}>;

function getPrivateProfileFriends(raw: PrivateProfileRaw) {
	const friendsSet = new Set<number>();

	for (const friendship of raw.friendshipsFrom) {
		if (isBannedUser(friendship.userB.status)) continue;
		friendsSet.add(friendship.userBId);
	}

	for (const friendship of raw.friendshipsTo) {
		if (isBannedUser(friendship.userA.status)) continue;
		friendsSet.add(friendship.userAId);
	}

	return Array.from(friendsSet.values()).map((id) => ({ id }));
}

function getPrivateProfileVisiblePoems(
	raw: PrivateProfileRaw,
	viewer: ProfileViewer,
	friends: Array<{ id: number }>,
) {
	return raw.poems.filter((poem) =>
		canViewPoem({
			viewer: {
				id: viewer.id,
				role: viewer.role as UserRole,
				status: viewer.status as UserStatus,
			},
			author: {
				id: raw.id,
				friendIds: friends.map((f) => f.id),
				status: raw.status,
			},
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
			},
		}),
	);
}

function mapPrivateProfilePoems(
	raw: PrivateProfileRaw,
	visiblePoems: PrivateProfileRaw['poems'],
) {
	return visiblePoems.map((poem) => ({
		id: poem.id,
		title: poem.title,
		slug: poem.slug,
		createdAt: poem.createdAt,
		likesCount: poem._count.poemLikes,
		commentsCount: poem._count.comments,
		tags: poem.tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
		})),
		author: {
			id: raw.id,
			name: raw.name,
			nickname: raw.nickname,
			avatarUrl: normalizeAvatarUrl(raw.avatarUrl),
		},
	}));
}

export function fromRawToPrivateProfile(
	raw: PrivateProfileRaw,
	viewer: ProfileViewer,
	options: { unreadNotificationsCount?: number } = {},
): UserPrivateProfileView {
	const friends = getPrivateProfileFriends(raw);
	const visiblePoems = getPrivateProfileVisiblePoems(raw, viewer, friends);
	const stats = {
		poems: visiblePoems.map((poem) => ({
			id: poem.id,
			title: poem.title,
		})),
		commentsIds: raw.comments.map((comment) => comment.id),
		friends,
	};

	const blockedUserIds = raw.blockedUsers.map((b) => b.blockedId);

	return {
		id: raw.id,
		nickname: raw.nickname,
		name: raw.name,
		bio: raw.bio,
		avatarUrl: normalizeAvatarUrl(raw.avatarUrl),
		role: raw.role,
		status: raw.status,
		email: raw.email,
		emailVerifiedAt: raw.emailVerifiedAt,
		unreadNotificationsCount:
			options.unreadNotificationsCount ?? raw.notifications.length,
		poems: mapPrivateProfilePoems(raw, visiblePoems),
		stats,
		blockedUsersIds: blockedUserIds,
	};
}

export const publicProfileSelect = {
	id: true,
	nickname: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	status: true,

	poems: {
		where: { deletedAt: null },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			title: true,
			slug: true,
			createdAt: true,
			status: true,
			visibility: true,
			moderationStatus: true,
			_count: {
				select: publicPoemEngagementCountSelect,
			},
			tags: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
	comments: { select: { id: true } },

	friendshipsFrom: {
		select: {
			userBId: true,
			userB: {
				select: {
					status: true,
				},
			},
		},
	},
	friendshipsTo: {
		select: {
			userAId: true,
			userA: {
				select: {
					status: true,
				},
			},
		},
	},

	blockedUsers: { select: { blockedId: true } },
	blockedBy: { select: { blockerId: true } },
} as const satisfies UserSelect;

export type PublicProfileRaw = Prisma.UserGetPayload<{
	select: typeof publicProfileSelect;
}>;

export function fromRawToPublicProfile(
	raw: PublicProfileRaw,
	viewer: ProfileViewer,
): UserPublicProfileView {
	const friendIds = [
		...raw.friendshipsFrom
			.filter((f) => !isBannedUser(f.userB.status))
			.map((f) => f.userBId),
		...raw.friendshipsTo
			.filter((f) => !isBannedUser(f.userA.status))
			.map((f) => f.userAId),
	];

	const visiblePoems = raw.poems.filter((poem) =>
		canViewPoem({
			viewer: {
				id: viewer.id,
				role: viewer.role as UserRole,
				status: viewer.status as UserStatus,
			},
			author: { id: raw.id, friendIds, status: raw.status },
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
			},
		}),
	);

	return {
		id: raw.id,
		nickname: raw.nickname,
		name: raw.name,
		bio: raw.bio,
		avatarUrl: normalizeAvatarUrl(raw.avatarUrl),
		role: raw.role,
		status: raw.status,
		poems: visiblePoems.map((poem) => ({
			id: poem.id,
			title: poem.title,
			slug: poem.slug,
			createdAt: poem.createdAt,
			likesCount: poem._count.poemLikes,
			commentsCount: poem._count.comments,
			tags: poem.tags.map((tag) => ({
				id: tag.id,
				name: tag.name,
			})),
			author: {
				id: raw.id,
				name: raw.name,
				nickname: raw.nickname,
				avatarUrl: normalizeAvatarUrl(raw.avatarUrl),
			},
		})),

		stats: {
			poemsCount: visiblePoems.length,
			commentsCount: raw.comments.length,
			friendsCount: friendIds.length,
		},

		isFriend: viewer.id !== undefined ? friendIds.includes(viewer.id) : false,

		hasBlockedRequester:
			viewer.id !== undefined
				? raw.blockedUsers.some((b) => b.blockedId === viewer.id)
				: false,

		isBlockedByRequester:
			viewer.id !== undefined
				? raw.blockedBy.some((b) => b.blockerId === viewer.id)
				: false,

		isFriendRequester: viewer.id !== undefined ? raw.id === viewer.id : false,
		hasIncomingFriendRequest: false,
	};
}
