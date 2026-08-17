import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';
import type { NotificationsCommandsServices } from '../ports/commands';
import { NotificationSchema } from '../ports/schemas/Notification';

export function createNotificationsCommandsRouter(
	services: NotificationsCommandsServices,
) {
	return new Elysia({ prefix: '/notifications' })
		.use(authPlugin)
		.delete(
			'/all',
			({ auth }) => {
				return services.deleteAllNotifications({
					userId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
				},
				detail: {
					summary: 'Delete All Notifications',
					description: 'Deletes all notifications for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		)
		.patch(
			'/:id/read',
			({ params, auth }) => {
				return services.markAsRead({
					notificationId: params.id,
					userId: auth.clientId,
				});
			},
			{
				params: t.Object({ id: idSchema }),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Mark Notification as Read',
					description:
						'Marks a specific notification as read for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		)
		.delete(
			'/:id',
			({ params, auth }) => {
				return services.deleteNotification({
					notificationId: params.id,
					userId: auth.clientId,
				});
			},
			{
				params: t.Object({ id: idSchema }),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Delete Notification',
					description:
						'Soft deletes a notification for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		)
		.patch(
			'/mark-all-read',
			({ auth }) => {
				return services.markAllAsRead({
					userId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
				},
				detail: {
					summary: 'Mark All Notifications as Read',
					description:
						'Marks all notifications as read for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		);
}
