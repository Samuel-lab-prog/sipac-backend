import { t } from 'elysia';
import { emailSchema, idSchema } from '@SharedKernel/schemas/schemas';

/** Fields a user is allowed to change on their own account. */
export const updateCurrentUserSchema = t.Object({
	email: t.Optional(emailSchema),
});

export const updateCurrentUserParamsSchema = t.Object({ id: idSchema });
