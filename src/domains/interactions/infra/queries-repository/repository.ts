import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/queries';
import type { PoemComment, PoemCommentsPage } from '../../ports/models';
import type { CommentSelect } from '@PrismaGenerated/models';
import {
	canViewBannedUserHistory,
	isBannedUser,
	publicUserRelationFilter,
	unavailableCommentContent,
	unavailableUserNickname,
} from '@SharedKernel/policies/BannedUserVisibility';

const poemCommentSelect: CommentSelect = {
	id: true,
	content: true,
	authorId: true,
	poemId: true,
	createdAt: true,
	parentId: true,
	status: true,
	author: {
		select: {
			id: true,
			nickname: true,
			avatarUrl: true,
			status: true,
		},
	},
};

type CommentRecord = {
	id: number;
	content: string;
	authorId: number;
	poemId: number;
	createdAt: Date;
	parentId: number | null;
	status: PoemComment['status'];
	author: {
		id: number;
		nickname: string;
		avatarUrl: string | null;
		status: string;
	};
};

export function selectCommentById(params: {
	commentId: number;
	currentUserId?: number;
}): Promise<PoemComment | null> {
	const { commentId, currentUserId } = params;

	return withPrismaErrorHandling(async () => {
		const comment = await prisma.comment.findUnique({
			where: { id: commentId },
			select: poemCommentSelect,
		});

		if (!comment) return null;

		const aggregateChildrenCount = await prisma.comment.count({
			where: { parentId: comment.id },
		});

		const likesCount = await prisma.commentLike.count({
			where: { commentId: comment.id },
		});

		const liked = currentUserId
			? await prisma.commentLike.findUnique({
					where: {
						userId_commentId: { userId: currentUserId, commentId: comment.id },
					},
				})
			: null;

		return {
			id: comment.id,
			content: comment.content,
			poemId: comment.poemId,
			parentId: comment.parentId,
			status: comment.status,
			createdAt: comment.createdAt,
			aggregateChildrenCount,
			likesCount,
			likedByCurrentUser: Boolean(liked),
			author: {
				id: comment.author.id,
				nickname: comment.author.nickname,
				avatarUrl: comment.author.avatarUrl,
				status: comment.author.status,
			},
		};
	});
}

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

function resolvePagination(params: { cursor?: number; limit?: number }) {
	const take = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
	return { take, cursor: params.cursor };
}

function getNextCursor<T extends { id: number }>(items: T[], hasMore: boolean) {
	return hasMore ? items[items.length - 1]?.id : undefined;
}

function mapComment(
	comment: CommentRecord,
	repliesMap: Map<number, number>,
	likesMap: Map<number, number>,
	likedMap: Map<number, boolean>,
	viewer: { role?: string; status?: string } = {},
): PoemComment {
	const shouldHideAuthor =
		isBannedUser(comment.author.status) && !canViewBannedUserHistory(viewer);

	return {
		id: comment.id,
		content: shouldHideAuthor ? unavailableCommentContent : comment.content,
		poemId: comment.poemId,
		parentId: comment.parentId,
		status: comment.status,
		createdAt: comment.createdAt,
		aggregateChildrenCount: repliesMap.get(comment.id) ?? 0,
		likesCount: shouldHideAuthor ? 0 : (likesMap.get(comment.id) ?? 0),
		likedByCurrentUser: shouldHideAuthor
			? false
			: (likedMap.get(comment.id) ?? false),
		author: {
			id: comment.author.id,
			nickname: shouldHideAuthor
				? unavailableUserNickname
				: comment.author.nickname,
			avatarUrl: shouldHideAuthor ? null : comment.author.avatarUrl,
			isUnavailable: shouldHideAuthor || undefined,
		},
	};
}

async function buildRepliesMap(commentIds: number[]) {
	const repliesCounts = await prisma.comment.groupBy({
		by: ['parentId'],
		where: { parentId: { in: commentIds } },
		_count: { id: true },
	});
	return new Map(repliesCounts.map((r) => [r.parentId!, r._count.id]));
}

async function buildLikesMap(commentIds: number[]) {
	const likesCounts = await prisma.commentLike.groupBy({
		by: ['commentId'],
		where: {
			commentId: { in: commentIds },
			user: publicUserRelationFilter,
		},
		_count: { userId: true },
	});
	return new Map(likesCounts.map((l) => [l.commentId, l._count.userId]));
}

async function buildLikedMap(commentIds: number[], currentUserId?: number) {
	if (!currentUserId) return new Map<number, boolean>();
	const likedComments = await prisma.commentLike.findMany({
		where: {
			commentId: { in: commentIds },
			userId: currentUserId,
		},
		select: { commentId: true },
	});
	return new Map(likedComments.map((c) => [Number(c.commentId), true]));
}

export function selectCommentsByPoemId(params: {
	poemId: number;
	currentUserId?: number;
	parentId?: number;
	viewerRole?: string;
	viewerStatus?: string;
	cursor?: number;
	limit?: number;
}): Promise<PoemCommentsPage> {
	const { poemId, currentUserId, parentId, viewerRole, viewerStatus } = params;
	const { take, cursor } = resolvePagination(params);

	return withPrismaErrorHandling(async () => {
		const comments = await prisma.comment.findMany({
			where: {
				poemId,
				parentId: parentId ?? null,
				status: 'visible',
			},
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			select: poemCommentSelect,
			cursor: cursor ? { id: cursor } : undefined,
			skip: cursor ? 1 : 0,
			take: take + 1,
		});

		const hasMore = comments.length > take;
		const items = comments.slice(0, take);

		const commentIds = items.map((c) => c.id);
		if (commentIds.length === 0) {
			return { comments: [], hasMore: false, nextCursor: undefined };
		}

		const [repliesMap, likesMap, likedMap] = await Promise.all([
			buildRepliesMap(commentIds),
			buildLikesMap(commentIds),
			buildLikedMap(commentIds, currentUserId),
		]);
		const mappedComments = items.map((c) =>
			mapComment(c, repliesMap, likesMap, likedMap, {
				role: viewerRole,
				status: viewerStatus,
			}),
		);

		return {
			comments: mappedComments,
			hasMore,
			nextCursor: getNextCursor(items, hasMore),
		};
	});
}

export function selectPoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<boolean> {
	const { userId, poemId } = params;
	return withPrismaErrorHandling(async () => {
		const like = await prisma.poemLike.findUnique({
			where: {
				userId_poemId: {
					userId,
					poemId,
				},
			},
		});
		return !!like;
	});
}

export function selectCommentLike(params: {
	userId: number;
	commentId: number;
}): Promise<boolean> {
	const { userId, commentId } = params;
	return withPrismaErrorHandling(async () => {
		const like = await prisma.commentLike.findUnique({
			where: {
				userId_commentId: {
					userId,
					commentId,
				},
			},
		});
		return !!like;
	});
}

export const queriesRepository: QueriesRepository = {
	selectCommentById,
	selectCommentsByPoemId,
	selectPoemLike,
	selectCommentLike,
};
