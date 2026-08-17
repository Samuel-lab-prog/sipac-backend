import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type {
	CommandsRepository,
	CreateNotificationParams,
} from '../../ports/commands';
import type {
	NotificationCreateResult,
	NotificationUpdateResult,
	NotificationDeleteResult,
} from '@Domains/notifications/ports/models';
import type { NotificationCreateInput } from '@PrismaGenerated/models';

function toPrismaCreateInput(
	params: CreateNotificationParams,
): NotificationCreateInput {
	return {
		user: { connect: { id: params.userId } },
		type: params.type,
		data: params.data ? params.data : undefined,
		actorId: params.actorId ?? undefined,
		entityId: params.entityId ?? undefined,
		entityType: params.entityType ?? null,
		aggregatedCount: params.aggregatedCount ?? 1,
	};
}

async function insertNotification(
	params: CreateNotificationParams,
): Promise<CommandResult<NotificationCreateResult>> {
	return await withPrismaResult(async () => {
		let notification;
		if (params.aggregateWindowMinutes && params.entityId && params.entityType) {
			// 1. First, try to find an existing notification to aggregate with base criteria
			const existing = await prisma.notification.findFirst({
				where: {
					userId: params.userId,
					type: params.type,
					entityId: params.entityId,
					entityType: params.entityType,
					createdAt: {
						gte: new Date(
							Date.now() - params.aggregateWindowMinutes * 60 * 1000,
						),
					},
				},
			});
			// 2. If found, update it by incrementing the aggregatedCount and updating the timestamp
			if (existing) {
				notification = await prisma.notification.update({
					where: { id: existing.id },
					data: {
						aggregatedCount: existing.aggregatedCount + 1,
						updatedAt: new Date(),
					},
				});
			}
		}
		// 3. If no existing notification to aggregate with, create a new one
		if (!notification) {
			notification = await prisma.notification.create({
				data: toPrismaCreateInput(params),
			});
		}

		return {
			id: notification.id,
			userId: notification.userId,
			type: notification.type,
			actorId: notification.actorId,
			entityId: notification.entityId,
			entityType: notification.entityType,
			aggregatedCount: notification.aggregatedCount,
			data: notification.data,
			createdAt: notification.createdAt,
			updatedAt: notification.updatedAt,
			readAt: notification.readAt,
		};
	});
}

async function markNotificationAsRead(
	notificationId: number,
): Promise<CommandResult<NotificationUpdateResult>> {
	console.table({ notificationId });
	return await withPrismaResult(() => {
		return prisma.notification.update({
			where: { id: notificationId },
			data: { readAt: new Date() },
		});
	});
}

async function deleteNotification(
	notificationId: number,
): Promise<CommandResult<NotificationDeleteResult>> {
	return await withPrismaResult(() => {
		return prisma.notification.delete({
			where: { id: notificationId },
		});
	});
}

async function deleteAllNotifications(params: {
	userId: number;
}): Promise<CommandResult<void>> {
	const { userId } = params;
	return await withPrismaResult(async () => {
		await prisma.notification.deleteMany({
			where: { userId },
		});
	});
}

async function markAllAsRead(params: {
	userId: number;
}): Promise<CommandResult<void>> {
	const { userId } = params;
	return await withPrismaResult(async () => {
		await prisma.notification.updateMany({
			where: { userId, readAt: null },
			data: { readAt: new Date() },
		});
	});
}

export const commandsRepository: CommandsRepository = {
	insertNotification,
	markNotificationAsRead,
	deleteNotification,
	deleteAllNotifications,
	markAllAsRead,
};
