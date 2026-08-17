import {
	DeleteNotificationResultSchema,
	NotificationsPageSchema,
	NotificationCreateResultSchema,
	NotificationSchema,
	NotificationTypeSchema,
	UpdateNotificationResultSchema,
} from './schemas/Notification';

export type NotificationType = (typeof NotificationTypeSchema)['static'];
export type Notification = (typeof NotificationSchema)['static'];
export type NotificationCreateResult =
	(typeof NotificationCreateResultSchema)['static'];
export type NotificationUpdateResult =
	(typeof UpdateNotificationResultSchema)['static'];
export type NotificationDeleteResult =
	(typeof DeleteNotificationResultSchema)['static'];

export type NotificationPage = (typeof NotificationsPageSchema)['static'];
