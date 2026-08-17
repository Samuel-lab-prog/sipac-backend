import type { InputJsonValue } from '@PrismaGenerated/internal/prismaNamespace';
import type {
	NotificationCreateResult,
	NotificationDeleteResult,
	NotificationType,
	NotificationUpdateResult,
} from './models';
import type { CommandResult } from '@SharedKernel/Types';
import type { Entity } from '@SharedKernel/events/EventBus';

export type CreateNotificationParams = {
	userId: number;
	type: NotificationType;
	actorId?: number;
	entityId?: number;

	entityType?: Entity;
	data?: InputJsonValue;
	aggregatedCount?: number;
	aggregateWindowMinutes?: number;
};

export type MarkNotificationAsReadParams = {
	notificationId: number;
	userId: number;
};

export type DeleteNotificationParams = {
	notificationId: number;
	userId: number;
};

export type DeleteAllNotificationsParams = {
	userId: number;
};

export interface NotificationsCommandsServices {
	markAsRead: (
		params: MarkNotificationAsReadParams,
	) => Promise<NotificationUpdateResult>;

	deleteNotification: (
		params: DeleteNotificationParams,
	) => Promise<NotificationDeleteResult>;
	deleteAllNotifications: (
		params: DeleteAllNotificationsParams,
	) => Promise<void>;

	createNotification: (
		params: CreateNotificationParams,
	) => Promise<NotificationCreateResult>;
	markAllAsRead: (params: { userId: number }) => Promise<void>;
}

export interface CommandsRepository {
	insertNotification(
		notification: CreateNotificationParams,
	): Promise<CommandResult<NotificationCreateResult>>;

	markNotificationAsRead(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationUpdateResult>>;

	deleteNotification(
		notificationId: number,
		userId: number,
	): Promise<CommandResult<NotificationDeleteResult>>;

	deleteAllNotifications(params: {
		userId: number;
	}): Promise<CommandResult<void>>;

	markAllAsRead(params: { userId: number }): Promise<CommandResult<void>>;
}
