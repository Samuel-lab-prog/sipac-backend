import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const UserSchema = t.Object({
	id: idSchema,
	name: t.String(),
	email: t.String({ format: 'email' }),
	createdAt: DateSchema,
	updatedAt: DateSchema,
});
