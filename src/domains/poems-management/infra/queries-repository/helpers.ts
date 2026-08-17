/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBannedUser } from '@SharedKernel/policies/BannedUserVisibility';

function getFriendIdsFromRelations(user: {
	friendshipsFrom?: { userBId: number }[] | null;
	friendshipsTo?: { userAId: number }[] | null;
}): number[] {
	return [
		...(user.friendshipsFrom?.map((f) => f.userBId) || []),
		...(user.friendshipsTo?.map((f) => f.userAId) || []),
	];
}

function calculateStats(poem: {
	_count: { poemLikes: number; comments: number };
}) {
	return {
		likesCount: poem._count.poemLikes,
		commentsCount: poem._count.comments,
	};
}

function mapToUsers(dedications: { toUser: any }[]) {
	return dedications
		.filter((d) => !isBannedUser(d.toUser.status))
		.map((d) => ({
			...d.toUser,
			friendIds: getFriendIdsFromRelations(d.toUser),
		}));
}

export function mapPoem<
	T extends { dedications: { toUser: any }[]; _count: any },
>(
	poem: T,
	author?: any,
): T & {
	toUsers: any[];
	stats: { likesCount: number; commentsCount: number };
	author?: any;
} {
	const result: any = {
		...poem,
		toUsers: mapToUsers(poem.dedications),
		stats: calculateStats(poem),
	};

	if (author) {
		result.author = {
			...author,
			friendIds: getFriendIdsFromRelations(author),
		};
	}

	return result;
}

export function mapPoemPreview(raw: any) {
	return {
		id: raw.id,
		title: raw.title,
		slug: raw.slug,
		excerpt: raw.excerpt ?? null,
		createdAt: raw.createdAt,
		status: raw.status,
		likesCount: raw._count?.poemLikes,
		commentsCount: raw._count?.comments,
		tags: (raw.tags ?? []).map((tag: { id: number; name: string }) => ({
			id: tag.id,
			name: tag.name,
		})),
		author: {
			id: raw.author.id,
			name: raw.author.name,
			nickname: raw.author.nickname,
			avatarUrl: raw.author.avatarUrl,
			friendIds: raw.author.friendIds ?? [],
		},
	};
}
