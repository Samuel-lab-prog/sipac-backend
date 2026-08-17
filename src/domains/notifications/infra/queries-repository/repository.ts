import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/queries';
import type { NotificationPage } from '../../ports/models';
import {
	selectBannedUserIds,
	visibleNotificationActorWhere,
} from '@Prisma/VisibilityFilters';

export function selectUserNotifications(
	userId: number,
	params: { onlyUnread: boolean; limit: number; nextCursor?: number },
): Promise<NotificationPage> {
	const { onlyUnread, limit, nextCursor } = params;

	return withPrismaErrorHandling(async () => {
		const bannedUserIds = await selectBannedUserIds();
		const where = {
			userId,
			...visibleNotificationActorWhere(bannedUserIds),
			...(onlyUnread && { readAt: null }),
		};

		const notifications = await prisma.notification.findMany({
			where,
			orderBy: {
				createdAt: 'desc',
			},
			take: limit + 1,
			...(nextCursor && {
				cursor: { id: nextCursor },
				skip: 1,
			}),
		});

		const hasMore = notifications.length > limit;
		const items = hasMore ? notifications.slice(0, limit) : notifications;
		const nextCursorId = hasMore ? items[items.length - 1]?.id : undefined;

		return {
			notifications: items,
			hasMore,
			nextCursor: nextCursorId,
		};
	});
}

function selectNotificationById(notificationId: number, userId: number) {
	return withPrismaErrorHandling(async () => {
		const bannedUserIds = await selectBannedUserIds();
		const notification = await prisma.notification.findFirst({
			where: {
				id: notificationId,
				userId,
				...visibleNotificationActorWhere(bannedUserIds),
			},
		});
		return notification;
	});
}

export const queriesRepository: QueriesRepository = {
	selectUserNotifications,
	selectNotificationById,
};
