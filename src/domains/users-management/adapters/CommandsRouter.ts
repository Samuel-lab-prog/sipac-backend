import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import { createUserSchema, userSchema } from '../ports/schemas';
import type { UsersCommandsServices } from '../ports/commands';

export function createUsersCommandsRouter(services: UsersCommandsServices) {
	return new Elysia({ prefix: '/users' }).post(
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
	);
}
