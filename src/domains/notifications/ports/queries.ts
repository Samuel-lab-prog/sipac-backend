import type { Notification, NotificationPage } from './models';

export type GetUserNotificationsParams = {
	userId: number;
	onlyUnread?: boolean;
	limit?: number;
	nextCursor?: number;
};

export type GetNotificationByIdParams = {
	userId: number;
	notificationId: number;
};

export interface NotificationsQueriesServices {
	getUserNotifications: (
		params: GetUserNotificationsParams,
	) => Promise<NotificationPage>;
	getNotificationById: (
		params: GetNotificationByIdParams,
	) => Promise<Notification>;
}

export interface QueriesRepository {
	selectUserNotifications: (
		userId: number,
		options: { onlyUnread: boolean; limit: number; nextCursor?: number },
	) => Promise<NotificationPage>;

	selectNotificationById: (
		notificationId: number,
		userId: number,
	) => Promise<Notification | null>;
}
