import { t } from 'elysia';
import { userSchema } from './user-schema';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const paginatedUsersSchema = t.Object({
	users: t.Array(userSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Optional(idSchema),
});
