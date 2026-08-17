import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/queries';
import type {
	MyPoem,
	AuthorPoem,
	PoemPreviewPage,
	SavedPoem,
	PoemCollection,
} from '../../ports/models';

import {
	authorPoemSelect,
	myPoemSelect,
	poemPreviewSelect,
	savedPoemSelect,
} from './selects';
import { mapPoem, mapPoemPreview } from './helpers';
import { publicUserRelationFilter } from '@SharedKernel/policies/BannedUserVisibility';

const DEFAULT_LIMIT = 20;

export function selectMyPoems(requesterId: number): Promise<MyPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId: requesterId,
				deletedAt: null,
			},
			select: myPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem));
	});
}

export function selectAuthorPoems(authorId: number): Promise<AuthorPoem[]> {
	return withPrismaErrorHandling(async () => {
		const poems = await prisma.poem.findMany({
			where: {
				authorId,
				deletedAt: null,
			},
			select: authorPoemSelect,
			orderBy: { createdAt: 'desc' },
		});

		return poems.map((poem) => mapPoem(poem, poem.author));
	});
}

export function selectPoemById(poemId: number): Promise<AuthorPoem | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findFirst({
			where: {
				id: poemId,
				deletedAt: null,
			},
			select: authorPoemSelect,
		});

		if (!poem) return null;

		return mapPoem(poem, poem.author);
	});
}

export function selectPendingPoems(params: {
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
}): Promise<AuthorPoem[]> {
	const { navigationOptions } = params;

	return withPrismaErrorHandling(async () => {
		const limit = navigationOptions.limit ?? DEFAULT_LIMIT;

		const poems = await prisma.poem.findMany({
			where: {
				deletedAt: null,
				moderationStatus: 'pending',
				status: 'published',
			},
			select: authorPoemSelect,
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			cursor: navigationOptions.cursor
				? { id: navigationOptions.cursor }
				: undefined,
			skip: navigationOptions.cursor ? 1 : 0,
			take: limit,
		});

		return poems.map((poem) => mapPoem(poem, poem.author));
	});
}

export function selectPoems(params: {
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
	sortOptions: {
		orderBy: 'createdAt' | 'title';
		orderDirection: 'asc' | 'desc';
	};
	filterOptions: {
		searchTitle?: string;
		tags?: string[];
	};
}): Promise<PoemPreviewPage> {
	const { navigationOptions, sortOptions, filterOptions } = params;

	return withPrismaErrorHandling(async () => {
		const limit = navigationOptions.limit ?? DEFAULT_LIMIT;

		const where = {
			deletedAt: null,
			status: 'published' as const,
			moderationStatus: 'approved' as const,
			author: publicUserRelationFilter,
			...(filterOptions.searchTitle && {
				title: {
					contains: filterOptions.searchTitle,
					mode: 'insensitive' as const,
				},
			}),
			...(filterOptions.tags?.length && {
				tags: {
					some: {
						name: {
							in: filterOptions.tags,
						},
					},
				},
			}),
		};

		const poems = await prisma.poem.findMany({
			where,
			select: poemPreviewSelect,
			orderBy: [
				{
					[sortOptions.orderBy]: sortOptions.orderDirection,
				},
				{
					id: sortOptions.orderDirection,
				},
			],
			cursor: navigationOptions.cursor
				? { id: navigationOptions.cursor }
				: undefined,
			skip: navigationOptions.cursor ? 1 : 0,
			take: limit + 1,
		});

		const hasMore = poems.length > limit;
		const items = poems.slice(0, limit);

		return {
			poems: items.map((poem) => mapPoemPreview(poem)),
			hasMore,
			nextCursor: hasMore ? items[items.length - 1]!.id : null,
		};
	});
}

function selectSavedPoems(requesterId: number): Promise<SavedPoem[]> {
	return withPrismaErrorHandling(async () => {
		const savedPoems = await prisma.savedPoem.findMany({
			where: {
				userId: requesterId,
				poem: {
					deletedAt: null,
					author: publicUserRelationFilter,
				},
			},
			select: savedPoemSelect,
		});

		return savedPoems.map((savedPoem) => ({
			id: savedPoem.poemId,
			savedAt: savedPoem.createdAt,
			poemId: savedPoem.poemId,
			title: savedPoem.poem.title,
			slug: savedPoem.poem.slug,
			author: savedPoem.poem.author,
		}));
	});
}

function selectSavedPoem(params: {
	poemId: number;
	userId: number;
}): Promise<SavedPoem | null> {
	return withPrismaErrorHandling(async () => {
		const savedPoem = await prisma.savedPoem.findFirst({
			where: {
				userId: params.userId,
				poemId: params.poemId,
			},
			select: savedPoemSelect,
		});
		if (!savedPoem) return null;

		return {
			id: savedPoem.poemId,
			savedAt: savedPoem.createdAt,
			poemId: savedPoem.poemId,
			title: savedPoem.poem.title,
			slug: savedPoem.poem.slug,
			author: savedPoem.poem.author,
		};
	});
}

function selectCollections(requesterId: number): Promise<PoemCollection[]> {
	return withPrismaErrorHandling(async () => {
		const collections = await prisma.collection.findMany({
			where: { userId: requesterId },
			select: {
				id: true,
				createdAt: true,
				updatedAt: true,
				name: true,
				description: true,
				items: {
					where: {
						poem: {
							deletedAt: null,
							author: publicUserRelationFilter,
						},
					},
					select: {
						poem: {
							select: {
								id: true,
								title: true,
								slug: true,
							},
						},
					},
				},
			},
		});

		return collections.map((collection) => ({
			createdAt: collection.createdAt,
			updatedAt: collection.updatedAt,
			description: collection.description,
			id: collection.id,
			name: collection.name,
			poemIds: collection.items.map((item) => item.poem.id),
		}));
	});
}

export const queriesRepository: QueriesRepository = {
	selectMyPoems,
	selectAuthorPoems,
	selectPoemById,
	selectPendingPoems,
	selectPoems,
	selectSavedPoems,
	selectSavedPoem,
	selectCollections,
};
