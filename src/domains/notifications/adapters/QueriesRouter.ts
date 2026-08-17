import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema, NonNegativeIntegerSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';

import { type NotificationsQueriesServices } from '../ports/queries';
import {
	NotificationSchema,
	NotificationsPageSchema,
} from '../ports/schemas//Notification';

export function createNotificationsQueriesRouter(
	services: NotificationsQueriesServices,
) {
	return new Elysia({ prefix: '/notifications' })
		.use(authPlugin)
		.get(
			'/',
			({ query, auth }) => {
				return services.getUserNotifications({
					userId: auth.clientId,
					onlyUnread: query.onlyUnread,
					limit: query.limit,
					nextCursor: query.nextCursor,
				});
			},
			{
				query: t.Partial(
					t.Object({
						onlyUnread: t.BooleanString(),
						limit: NonNegativeIntegerSchema,
						nextCursor: idSchema,
					}),
				),
				response: {
					200: NotificationsPageSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Get User Notifications',
					description:
						'Lists notifications for the authenticated user, optionally filtering unread only.',
					tags: ['Notifications'],
				},
			},
		)
		.get(
			'/:id',
			({ params, auth }) => {
				return services.getNotificationById({
					userId: auth.clientId,
					notificationId: params.id,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: NotificationSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get Notification By ID',
					description:
						'Returns a single notification for the authenticated user.',
					tags: ['Notifications'],
				},
			},
		);
}
