import { t } from 'elysia';
import { userSchema } from './user-schema';

export const paginatedUsersSchema = t.Object({
	users: t.Array(userSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Optional(t.Number()),
});
