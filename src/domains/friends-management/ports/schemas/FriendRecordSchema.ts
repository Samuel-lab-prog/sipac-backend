import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const FriendRecordSchema = t.Object({
	id: idSchema,
	userAId: idSchema,
	userBId: idSchema,
	createdAt: DateSchema,
});
