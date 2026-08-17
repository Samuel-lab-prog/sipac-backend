import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';
import { sanctionReasonSchema } from './Fields';

export const bannedUserResponseSchema = t.Object({
	id: idSchema,
	moderatorId: idSchema,
	bannedUserId: idSchema,

	reason: sanctionReasonSchema,
	bannedAt: DateSchema,
});
