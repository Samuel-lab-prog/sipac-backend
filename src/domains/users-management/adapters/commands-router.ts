import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	createUserSchema,
	updateUserParamsSchema,
	updateUserSchema,
	userSchema,
} from '../ports/schemas';
import type { UsersCommandsServices } from '../ports/commands';

export function createUsersCommandsRouter(services: UsersCommandsServices) {
	return new Elysia({ prefix: '/users' })
		.post(
			'/',
			async ({ body, set }) => {
				const result = await services.createUser({ data: body });
				set.status = 201;
				return result;
			},
			{
				body: createUserSchema,
				response: { 201: userSchema, 409: appErrorSchema, 422: appErrorSchema },
				detail: { summary: 'Create User', tags: ['Users Management'] },
			},
		)
		.use(authPlugin)
		.put(
			'/me',
			({ body, auth }) =>
				services.updateCurrentUser({
					clientId: auth.clientId,
					clientRole: auth.clientRole,
					clientStatus: auth.clientStatus,
					data: body,
				}),
			{
				body: updateUserSchema,
				response: {
					200: userSchema,
					409: appErrorSchema,
					422: appErrorSchema,
					401: appErrorSchema,
				},
				detail: { summary: 'Update Current User', tags: ['Users Management'] },
			},
		)
		.put(
			'/:id',
			({ params, body, auth }) =>
				services.updateUser({
					params,
					data: body,
					clientId: auth.clientId,
					clientRole: auth.clientRole,
					clientStatus: auth.clientStatus,
				}),
			{
				params: updateUserParamsSchema,
				body: updateUserSchema,
				response: {
					200: userSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
					401: appErrorSchema,
				},
				detail: { summary: 'Update User', tags: ['Users Management'] },
			},
		);
}
