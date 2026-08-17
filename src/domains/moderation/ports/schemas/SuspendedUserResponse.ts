import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';
import { sanctionReasonSchema } from './Fields';

export const suspendedUserResponseSchema = t.Object({
	id: idSchema,
	moderatorId: idSchema,
	suspendedUserId: idSchema,

	reason: sanctionReasonSchema,
	suspendedAt: DateSchema,
	endAt: DateSchema,
});
