import { prisma } from '@Prisma/PrismaClient';
import {
	withPrismaErrorHandling,
	withPrismaResult,
} from '@Prisma/PrismaErrorHandler';

import type { CommandsRepository } from '../../ports/commands';
import type {
	BannedUserResponse,
	ModeratePoemResult,
	SuspendedUserResponse,
} from '../../ports/models';

import {
	banSelect,
	fromRawToBannedUser,
	fromRawToSuspendedUser,
	poemModerationSelect,
	suspensionSelect,
} from './selects';

export function createBan(params: {
	userId: number;
	reason: string;
	moderatorId: number;
}): Promise<BannedUserResponse> {
	const { userId, reason, moderatorId } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.$transaction(async (tx) => {
			const created = await tx.userSanction.create({
				data: {
					userId,
					moderatorId,
					reason,
					type: 'ban',
				},
				select: banSelect,
			});

			await tx.user.update({
				where: { id: userId, deletedAt: null },
				data: { status: 'banned' },
			});

			await tx.userSanction.updateMany({
				where: {
					userId,
					type: 'suspension',
					endAt: null,
				},
				data: { endAt: new Date() },
			});

			await tx.friendshipRequest.deleteMany({
				where: {
					OR: [{ requesterId: userId }, { addresseeId: userId }],
				},
			});

			await tx.notification.deleteMany({
				where: { actorId: userId },
			});

			return created;
		});

		return fromRawToBannedUser(rs);
	});
}

export function createSuspension(params: {
	userId: number;
	reason: string;
	moderatorId: number;
	endAt: Date;
}): Promise<SuspendedUserResponse> {
	const { userId, reason, moderatorId, endAt } = params;

	return withPrismaErrorHandling(async () => {
		const rs = await prisma.$transaction(async (tx) => {
			const created = await tx.userSanction.create({
				data: {
					userId,
					moderatorId,
					reason,
					endAt,
					type: 'suspension',
				},
				select: suspensionSelect,
			});

			await tx.user.update({
				where: { id: userId, deletedAt: null },
				data: { status: 'suspended' },
			});

			return created;
		});
		return fromRawToSuspendedUser(rs);
	});
}

export function updatePoemModerationStatus(params: {
	poemId: number;
	moderationStatus: ModeratePoemResult['moderationStatus'];
	reason?: string;
}) {
	return withPrismaResult(async () => {
		const rs = await prisma.poem.update({
			where: { id: params.poemId, deletedAt: null },
			data: {
				moderationStatus: params.moderationStatus,
				rejectionReason:
					params.moderationStatus === 'rejected'
						? params.reason?.trim() || null
						: null,
			},
			select: poemModerationSelect,
		});

		return {
			id: rs.id,
			moderationStatus: rs.moderationStatus,
		};
	});
}

export function endBan(params: { banId: number; endAt: Date }): Promise<void> {
	const { banId, endAt } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction(async (tx) => {
			const sanction = await tx.userSanction.update({
				where: { id: banId },
				data: { endAt },
				select: { userId: true },
			});

			await tx.user.update({
				where: { id: sanction.userId, deletedAt: null },
				data: { status: 'active' },
			});
		});
	});
}

export function endSuspension(params: {
	suspensionId: number;
	endAt: Date;
}): Promise<void> {
	const { suspensionId, endAt } = params;
	return withPrismaErrorHandling(async () => {
		await prisma.$transaction(async (tx) => {
			const sanction = await tx.userSanction.update({
				where: { id: suspensionId },
				data: { endAt },
				select: { userId: true },
			});

			await tx.user.update({
				where: { id: sanction.userId, deletedAt: null },
				data: { status: 'active' },
			});
		});
	});
}

export function activateUser(params: { userId: number }): Promise<void> {
	return withPrismaErrorHandling(async () => {
		await prisma.user.update({
			where: { id: params.userId, deletedAt: null },
			data: { status: 'active' },
		});
	});
}

export const commandsRepository: CommandsRepository = {
	createBan,
	createSuspension,
	updatePoemModerationStatus,
	endBan,
	endSuspension,
	activateUser,
};
