import { appErrorSchema } from '@AppError';
import { Elysia, t } from 'elysia';
import { UserSchema } from '../ports/schemas/Index';
import type { UsersQueriesRouterServices } from '../ports/queries';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' }).get(
		'/',
		async ({ query }) => services.searchUsers(query),
		{
			query: t.Object({
				searchTerm: t.Optional(t.String()),
				limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
				cursor: t.Optional(t.Number({ minimum: 1 })),
			}),
			response: { 200: t.Object({ users: t.Array(UserSchema), hasMore: t.Boolean(), nextCursor: t.Optional(t.Number()) }), 422: appErrorSchema },
			detail: { summary: 'Search Users', tags: ['Users Management'] },
		},
	);
}
