import { t } from 'elysia';
import {
	DateSchema,
	idSchema,
	NullableDateSchema,
} from '@SharedKernel/Schemas';
import type { Entity, EventName } from '@SharedKernel/events/EventBus';

const notificationTypes = [
	'POEM_COMMENT_CREATED',
	'NEW_FRIEND',
	'NEW_FRIEND_REQUEST',
	'POEM_LIKED',
	'POEM_COMMENT_REPLIED',
	'POEM_DEDICATED',
	'USER_MENTION_IN_POEM',
	'POEM_APPROVED',
	'POEM_REJECTED',
	'POEM_REMOVED',
] as const satisfies readonly EventName[];
const entityTypes = [
	'POEM',
	'COMMENT',
	'USER',
] as const satisfies readonly Entity[];

export const NotificationTypeSchema = t.UnionEnum(notificationTypes);
export const EntityTypeSchema = t.UnionEnum(entityTypes);

export const NotificationSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	type: NotificationTypeSchema,
	actorId: t.Nullable(idSchema),
	entityId: t.Nullable(idSchema),
	entityType: t.Nullable(EntityTypeSchema),
	aggregatedCount: t.Number(),
	data: t.Nullable(t.Any()),
	createdAt: DateSchema,
	updatedAt: DateSchema,
	readAt: NullableDateSchema,
});

export const NotificationsPageSchema = t.Object({
	notifications: t.Array(NotificationSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Optional(idSchema),
});

export const NotificationCreateResultSchema = NotificationSchema;
export const UpdateNotificationResultSchema = NotificationSchema;
export const DeleteNotificationResultSchema = NotificationSchema;
