/* eslint-disable @typescript-eslint/no-explicit-any */
import { withRequestCache } from '@GenericSubdomains/utils/requests-handling/request-caching/requestCache';
import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { PoemSelect, PoemWhereInput } from '@PrismaGenerated/models';
import type { UserStatus } from '@SharedKernel/Enums';
import { publicUserRelationFilter } from '@SharedKernel/policies/BannedUserVisibility';
import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
} from '../ports/models';

export type PoemBasicInfo = {
	exists: boolean;
	id: number;
	authorId: number;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	status: PoemStatus;
	authorStatus: UserStatus;
	isCommentable: boolean;
	poemTitle: string;
};

export type FeedPoem = {
	id: number;
	content: string;
	title: string;
	slug: string;
	excerpt: string | null;
	tags: string[];
	createdAt: Date;
	likesCount: number;
	commentsCount: number;
	author: {
		id: number;
		name: string;
		nickname: string;
		avatarUrl: string;
	};
};

const DEFAULT_AVATAR_URL =
	process.env.DEFAULT_AVATAR_URL ?? 'https://cdn.example.com/avatar.png';

export interface PoemsPublicContract {
	selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo>;
}

interface PoemsFeedContract {
	getFeedPoemsByAuthorIds(params: {
		authorIds: number[];
		limit: number;
		visibilities?: PoemVisibility[];
		cursor?: Date;
	}): Promise<FeedPoem[]>;

	getPublicFeedPoems(params: {
		limit: number;
		excludeAuthorIds?: number[];
		excludePoemIds?: number[];
		cursor?: Date;
	}): Promise<FeedPoem[]>;
}

function selectPoemBasicInfo(poemId: number): Promise<PoemBasicInfo> {
	return withRequestCache(`poems.basic:${poemId}`, () =>
		withPrismaErrorHandling(async () => {
			const poem = await prisma.poem.findUnique({
				where: { id: poemId, deletedAt: null },
				select: {
					id: true,
					authorId: true,
					author: {
						select: {
							status: true,
						},
					},
					visibility: true,
					moderationStatus: true,
					status: true,
					isCommentable: true,
					title: true,
				},
			});

			if (!poem) {
				return {
					exists: false,
					id: poemId,
					authorId: -1,
					visibility: 'private',
					moderationStatus: 'pending',
					status: 'draft',
					authorStatus: 'banned',
					isCommentable: false,
					poemTitle: '',
				};
			}

			return {
				exists: true,
				id: poem.id,
				authorId: poem.authorId,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
				status: poem.status,
				authorStatus: poem.author.status,
				isCommentable: poem.isCommentable,
				poemTitle: poem.title,
			};
		}),
	);
}
export const poemsPublicContract: PoemsPublicContract = {
	selectPoemBasicInfo,
};

const feedSelect: PoemSelect = {
	id: true,
	content: true,
	title: true,
	slug: true,
	excerpt: true,
	createdAt: true,
	_count: {
		select: {
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
		},
	},
	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			status: true,
		},
	},
	tags: {
		select: {
			name: true,
		},
	},
};

function mapToFeedPoem(poem: any): FeedPoem {
	return {
		id: poem.id,
		content: poem.content,
		title: poem.title,
		slug: poem.slug,
		excerpt: poem.excerpt ?? null,
		tags: poem.tags.map((t: any) => t.name),
		createdAt: poem.createdAt,
		likesCount: poem._count?.poemLikes ?? 0,
		commentsCount: poem._count?.comments ?? 0,
		author: {
			id: poem.author.id,
			name: poem.author.name,
			nickname: poem.author.nickname,
			avatarUrl: poem.author.avatarUrl ?? DEFAULT_AVATAR_URL,
		},
	};
}

function baseWhere(visibilities?: PoemVisibility[]): PoemWhereInput {
	return {
		deletedAt: null,
		visibility: visibilities?.length ? { in: visibilities } : 'public',
		moderationStatus: 'approved',
		status: 'published',
		author: publicUserRelationFilter,
	};
}

// eslint-disable-next-line require-await
async function getFeedPoemsByAuthorIds(params: {
	authorIds: number[];
	limit: number;
	visibilities?: PoemVisibility[];
	cursor?: Date;
}): Promise<FeedPoem[]> {
	const { authorIds, limit, cursor, visibilities } = params;

	if (authorIds.length === 0) return [];

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				...baseWhere(visibilities ?? ['public']),
				authorId: { in: authorIds },
				...(cursor && {
					createdAt: { lt: cursor },
				}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
			select: feedSelect,
		});

		return poems.map(mapToFeedPoem);
	});
}

// eslint-disable-next-line require-await
async function getPublicFeedPoems(params: {
	limit: number;
	cursor?: Date;
	excludeAuthorIds?: number[];
	excludePoemIds?: number[];
}): Promise<FeedPoem[]> {
	const { limit, cursor, excludeAuthorIds, excludePoemIds } = params;

	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				...baseWhere(),
				...(cursor && {
					createdAt: { lt: cursor },
				}),
				...(excludeAuthorIds?.length && {
					authorId: { notIn: excludeAuthorIds },
				}),
				...(excludePoemIds?.length && {
					id: { notIn: excludePoemIds },
				}),
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: limit,
			select: feedSelect,
		});

		return poems.map(mapToFeedPoem);
	});
}

export const poemsFeedContract: PoemsFeedContract = {
	getFeedPoemsByAuthorIds,
	getPublicFeedPoems,
};

export * from './UserProfiles';

