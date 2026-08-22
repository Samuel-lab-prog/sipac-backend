import { appErrorSchema } from '@AppError';
import { Elysia, t } from 'elysia';
import { paginatedUsersSchema } from '../ports/schemas';
import type { UsersQueriesRouterServices } from '../ports/queries';
import { idSchema } from '@SharedKernel/index';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' }).get(
		'/',
		({ query }) => services.searchUsers(query),
		{
			query: t.Object({
				searchTerm: t.Optional(t.String()),
				limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
				cursor: t.Optional(idSchema),
			}),
			response: {
				200: paginatedUsersSchema,
				422: appErrorSchema,
			},
			detail: { summary: 'Search Users', tags: ['Users Management'] },
		},
	);
}
