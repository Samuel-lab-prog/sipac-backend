import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const FriendRequestSchema = t.Object({
	id: idSchema,
	requesterId: idSchema,
	addresseeId: idSchema,
	createdAt: DateSchema,
});
