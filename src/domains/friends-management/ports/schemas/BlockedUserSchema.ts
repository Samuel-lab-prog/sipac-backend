import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const BlockedUserSchema = t.Object({
	id: idSchema,
	blockedById: idSchema,
	blockedUserId: idSchema,
	createdAt: DateSchema,
});
