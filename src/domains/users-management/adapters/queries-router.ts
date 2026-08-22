import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema } from '@SharedKernel/schemas/schemas';
import { Elysia, t } from 'elysia';
import {
	paginatedUsersSchema,
	userSchema,
	userIdParamsSchema,
} from '../ports/schemas';
import type { UsersQueriesRouterServices } from '../ports/queries';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.use(authPlugin)
		.get('/', ({ query }) => services.searchUsers(query), {
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
		})
		.use(authPlugin)
		.get(
			'/:id',
			({ params, auth }) =>
				services.getUserById({
					id: params.id,
					...auth,
				}),
			{
				params: userIdParamsSchema,
				response: {
					200: userSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: { summary: 'Get User By Id', tags: ['Users Management'] },
			},
		);
}
