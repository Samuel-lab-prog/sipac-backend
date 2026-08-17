import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';

import type { QueriesRepository } from '../../ports/queries';
import type {
	BannedUserResponse,
	PoemModerationRead,
	PoemNotificationsData,
	SuspendedUserResponse,
	UserSanctionRead,
} from '../../ports/models';
import {
	fromRawToSuspendedUser,
	suspensionSelect,
	banSelect,
	fromRawToBannedUser,
} from '../commands-repository/selects';

export function selectActiveBanByUserId(params: {
	userId: number;
}): Promise<BannedUserResponse | null> {
	const { userId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'ban',
				endAt: null,
			},
			select: banSelect,
		});
		return rs ? fromRawToBannedUser(rs) : null;
	});
}

export function selectActiveSuspensionByUserId(params: {
	userId: number;
}): Promise<SuspendedUserResponse | null> {
	const { userId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.userSanction.findFirst({
			where: {
				userId,
				type: 'suspension',
				endAt: null,
			},
			select: suspensionSelect,
		});

		return rs ? fromRawToSuspendedUser(rs) : null;
	});
}

export function selectUserSanctions(params: {
	userId: number;
}): Promise<UserSanctionRead[]> {
	const { userId } = params;
	return withPrismaErrorHandling(async () => {
		const sanctions = await prisma.userSanction.findMany({
			where: { userId },
			orderBy: { startAt: 'desc' },
			select: {
				id: true,
				userId: true,
				moderatorId: true,
				type: true,
				reason: true,
				startAt: true,
				endAt: true,
			},
		});

		return sanctions.map((s) => ({
			id: s.id,
			userId: s.userId,
			moderatorId: s.moderatorId,
			type: s.type,
			reason: s.reason,
			startAt: s.startAt,
			endAt: s.endAt ?? null,
		}));
	});
}

export function selectPoemById(
	poemId: number,
): Promise<PoemModerationRead | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findFirst({
			where: {
				id: poemId,
				deletedAt: null,
			},
			select: {
				id: true,
				title: true,
				status: true,
				visibility: true,
				moderationStatus: true,
				author: {
					select: {
						id: true,
						nickname: true,
						avatarUrl: true,
					},
				},
			},
		});

		if (!poem) return null;

		return {
			id: poem.id,
			title: poem.title,
			status: poem.status,
			visibility: poem.visibility,
			moderationStatus: poem.moderationStatus,
			author: {
				id: poem.author.id,
				nickname: poem.author.nickname,
				avatarUrl: poem.author.avatarUrl ?? null,
			},
		};
	});
}

export function selectPoemNotificationsData(
	poemId: number,
): Promise<PoemNotificationsData | null> {
	return withPrismaErrorHandling(async () => {
		const poem = await prisma.poem.findFirst({
			where: {
				id: poemId,
				deletedAt: null,
			},
			select: {
				id: true,
				title: true,
				author: {
					select: {
						id: true,
						nickname: true,
						avatarUrl: true,
						friendshipsFrom: {
							select: {
								userBId: true,
								userAId: true,
							},
						},
						friendshipsTo: {
							select: {
								userAId: true,
								userBId: true,
							},
						},
					},
				},
				dedications: {
					select: {
						toUserId: true,
					},
				},
				userMentions: {
					select: {
						mentionedUserId: true,
					},
				},
			},
		});

		if (!poem) return null;

		const authorFriendIds = [
			...(poem.author.friendshipsFrom?.map((f) => f.userBId) || []),
			...(poem.author.friendshipsTo?.map((f) => f.userAId) || []),
		];

		return {
			id: poem.id,
			title: poem.title,
			authorId: poem.author.id,
			authorNickname: poem.author.nickname,
			authorAvatarUrl: poem.author.avatarUrl ?? null,
			authorFriendIds,
			dedicatedUserIds: poem.dedications.map((d) => d.toUserId),
			mentionedUserIds: poem.userMentions.map((m) => m.mentionedUserId),
		};
	});
}

export const queriesRepository: QueriesRepository = {
	selectActiveBanByUserId,
	selectActiveSuspensionByUserId,
	selectUserSanctions,
	selectPoemById,
	selectPoemNotificationsData,
};
