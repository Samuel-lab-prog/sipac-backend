import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import { CreateUserSchema, UserSchema } from '../ports/schemas/Index';
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
			body: CreateUserSchema,
			response: { 201: UserSchema, 409: appErrorSchema, 422: appErrorSchema },
			detail: { summary: 'Create User', tags: ['Users Management'] },
		},
	);
}
