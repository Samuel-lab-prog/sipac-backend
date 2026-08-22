import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	paginatedUsersSchema,
	searchUsersQuerySchema,
	userSchema,
	userIdParamsSchema,
} from '../ports/schemas';
import type { UsersQueriesRouterServices } from '../ports/queries';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	return new Elysia({ prefix: '/users' })
		.use(authPlugin)
		.get(
			'/me',
			({ auth }) =>
				services.getCurrentUser({
					clientId: auth.clientId,
					clientRole: auth.clientRole,
					clientStatus: auth.clientStatus,
				}),
			{
				response: { 200: userSchema, 401: appErrorSchema, 404: appErrorSchema },
				detail: { summary: 'Get Current User', tags: ['Users Management'] },
			},
		)
		.get('/', ({ query }) => services.searchUsers(query), {
			query: searchUsersQuerySchema,
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
