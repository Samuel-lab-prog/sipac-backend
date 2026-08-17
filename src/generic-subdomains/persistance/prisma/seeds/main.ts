/* eslint-disable max-lines -- Seed orchestration is kept together for auditability. */
import { green } from 'kleur/colors';
import { clearDatabase } from '@ClearDatabase';
import { BcryptHashService } from '@SharedKernel/infra/Bcrypt';
import { prisma } from '../PrismaClient';
import type { Prisma } from '../generated/client';
import { poemSeeds } from './data/poems';
import {
	collectionSeeds,
	commentSeeds,
	dedicationSeeds,
	friendRequestSeeds,
	friendshipSeeds,
	notificationSeeds,
	poemLikeSeeds,
	savedPoemSeeds,
} from './data/social';
import { userSeeds } from './data/users';
import type {
	CommentKey,
	NotificationEntity,
	PoemKey,
	UserNickname,
} from './data/types';

const DEFAULT_PASSWORD = 'password123';

function assertSafeEnvironment() {
	const nodeEnv = process.env.NODE_ENV ?? 'development';
	const allowProductionSeed = process.env.ALLOW_PROD_SEED === 'true';

	if (nodeEnv === 'production' && !allowProductionSeed)
		throw new Error(
			'Refusing to seed production database. Set ALLOW_PROD_SEED=true to override.',
		);

}

function asDate(value: string): Date {
	return new Date(value);
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

function firstLine(content: string): string {
	return content.split('\n')[0]?.trim() ?? '';
}

function requireId<T extends string>(
	ids: Map<T, number>,
	key: T,
	entity: string,
): number {
	const id = ids.get(key);
	if (!id) throw new Error(`Missing ${entity} seed reference: ${key}`);
	return id;
}

function orderedPair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a];
}

async function seedUsers() {
	const passwordHash = await BcryptHashService.hash(DEFAULT_PASSWORD);
	const userIds = new Map<UserNickname, number>();

	for (const user of userSeeds) {
		const created = await prisma.user.create({
			data: {
				email: user.email,
				passwordHash,
				name: user.name,
				nickname: user.nickname,
				bio: user.bio,
				avatarUrl: user.avatarUrl,
				role: 'author',
				status: 'active',
				createdAt: asDate(user.createdAt),
				emailVerifiedAt: asDate(user.emailVerifiedAt),
			},
			select: { id: true },
		});

		userIds.set(user.nickname, created.id);
	}

	return userIds;
}

async function seedPoems(userIds: Map<UserNickname, number>) {
	const poemIds = new Map<PoemKey, number>();

	for (const poem of poemSeeds) {
		const authorId = requireId(userIds, poem.authorNickname, 'user');
		const created = await prisma.poem.create({
			data: {
				title: poem.title,
				slug: slugify(`${poem.title}-${poem.key}`),
				excerpt: firstLine(poem.content),
				content: poem.content,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
				rejectionReason: poem.rejectionReason ?? null,
				isCommentable: poem.isCommentable ?? true,
				createdAt: asDate(poem.createdAt),
				author: { connect: { id: authorId } },
				tags: {
					connectOrCreate: poem.tags.map((tag) => ({
						where: { name: tag },
						create: { name: tag },
					})),
				},
			},
			select: { id: true },
		});

		poemIds.set(poem.key, created.id);
	}

	return poemIds;
}

async function seedFriendships(userIds: Map<UserNickname, number>) {
	for (const friendship of friendshipSeeds) {
		const userAId = requireId(userIds, friendship.userA, 'user');
		const userBId = requireId(userIds, friendship.userB, 'user');
		const [orderedUserAId, orderedUserBId] = orderedPair(userAId, userBId);

		await prisma.friendship.create({
			data: {
				userAId: orderedUserAId,
				userBId: orderedUserBId,
				createdAt: asDate(friendship.createdAt),
			},
		});
	}
}

async function seedFriendRequests(userIds: Map<UserNickname, number>) {
	for (const request of friendRequestSeeds) {
		await prisma.friendshipRequest.create({
			data: {
				requesterId: requireId(userIds, request.requester, 'user'),
				addresseeId: requireId(userIds, request.addressee, 'user'),
				createdAt: asDate(request.createdAt),
			},
		});
	}
}

async function seedComments(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
) {
	const commentIds = new Map<CommentKey, number>();

	for (const comment of commentSeeds) {
		const created = await prisma.comment.create({
			data: {
				content: comment.content,
				createdAt: asDate(comment.createdAt),
				authorId: requireId(userIds, comment.authorNickname, 'user'),
				poemId: requireId(poemIds, comment.poemKey, 'poem'),
			},
			select: { id: true },
		});

		commentIds.set(comment.key, created.id);
	}

	return commentIds;
}

async function seedPoemLikes(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
) {
	const data = poemLikeSeeds.flatMap((group) =>
		group.userNicknames.map((userNickname) => ({
			userId: requireId(userIds, userNickname, 'user'),
			poemId: requireId(poemIds, group.poemKey, 'poem'),
		})),
	);

	if (data.length > 0) {
		await prisma.poemLike.createMany({
			data,
			skipDuplicates: true,
		});
	}
}

async function seedCommentLikes(
	userIds: Map<UserNickname, number>,
	commentIds: Map<CommentKey, number>,
) {
	const data = commentSeeds.flatMap((comment) =>
		(comment.likesFrom ?? []).map((userNickname) => ({
			userId: requireId(userIds, userNickname, 'user'),
			commentId: requireId(commentIds, comment.key, 'comment'),
		})),
	);

	if (data.length > 0)
		await prisma.commentLike.createMany({
			data,
			skipDuplicates: true,
		});
}

async function seedSavedPoems(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
) {
	await prisma.savedPoem.createMany({
		data: savedPoemSeeds.map((savedPoem) => ({
			userId: requireId(userIds, savedPoem.userNickname, 'user'),
			poemId: requireId(poemIds, savedPoem.poemKey, 'poem'),
			createdAt: asDate(savedPoem.createdAt),
		})),
		skipDuplicates: true,
	});
}

async function seedCollections(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
) {
	for (const collection of collectionSeeds) {
		await prisma.collection.create({
			data: {
				userId: requireId(userIds, collection.ownerNickname, 'user'),
				name: collection.name,
				description: collection.description,
				items: {
					create: collection.poemKeys.map((poemKey) => ({
						poemId: requireId(poemIds, poemKey, 'poem'),
					})),
				},
			},
		});
	}
}

async function seedDedications(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
) {
	for (const dedication of dedicationSeeds) {
		await prisma.poemDedication.create({
			data: {
				poemId: requireId(poemIds, dedication.poemKey, 'poem'),
				toUserId: requireId(userIds, dedication.toUserNickname, 'user'),
				createdAt: asDate(dedication.createdAt),
			},
		});
	}
}

function resolveNotificationEntityId(
	entity: NotificationEntity,
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
	commentIds: Map<CommentKey, number>,
) {
	if (entity.type === 'POEM') {
		return requireId(poemIds, entity.poemKey, 'poem');
	}

	if (entity.type === 'COMMENT') {
		return requireId(commentIds, entity.commentKey, 'comment');
	}

	return requireId(userIds, entity.userNickname, 'user');
}

async function seedNotifications(
	userIds: Map<UserNickname, number>,
	poemIds: Map<PoemKey, number>,
	commentIds: Map<CommentKey, number>,
) {
	for (const notification of notificationSeeds) {
		const createdAt = asDate(notification.createdAt);

		await prisma.notification.create({
			data: {
				userId: requireId(userIds, notification.recipientNickname, 'user'),
				type: notification.type,
				actorId: notification.actorNickname
					? requireId(userIds, notification.actorNickname, 'user')
					: null,
				entityId: resolveNotificationEntityId(
					notification.entity,
					userIds,
					poemIds,
					commentIds,
				),
				entityType: notification.entity.type,
				aggregatedCount: notification.aggregatedCount ?? 1,
				data: notification.data as Prisma.InputJsonValue,
				createdAt,
				updatedAt: createdAt,
				readAt: notification.readAt ? asDate(notification.readAt) : null,
			},
		});
	}
}

async function main() {
	assertSafeEnvironment();
	console.log('Starting curated database seed...');

	try {
		await clearDatabase();

		const userIds = await seedUsers();
		const poemIds = await seedPoems(userIds);
		await seedFriendships(userIds);
		await seedFriendRequests(userIds);
		const commentIds = await seedComments(userIds, poemIds);
		await seedPoemLikes(userIds, poemIds);
		await seedCommentLikes(userIds, commentIds);
		await seedSavedPoems(userIds, poemIds);
		await seedCollections(userIds, poemIds);
		await seedDedications(userIds, poemIds);
		await seedNotifications(userIds, poemIds, commentIds);

		console.log(
			green(
				`Curated database seed completed: ${userIds.size} users, ${poemIds.size} poems, ${commentIds.size} comments.`,
			),
		);
	} catch (error) {
		console.error('Error during database seeding:', error);
		process.exitCode = 1;
	}
}

main().finally(async () => {
	await prisma.$disconnect();
});
