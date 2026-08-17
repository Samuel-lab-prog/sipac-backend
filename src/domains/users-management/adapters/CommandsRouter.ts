import { authPlugin } from '@GenericSubdomains/authentication/composition';
import {
	appErrorSchema,
	makeValidationError,
} from '@AppError';
import { idSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';

import {
	AvatarUploadUrlSchema,
	CreateUserSchema,
	FullUserSchema,
	UpdateUserBodySchema,
} from '../ports/schemas/Index';

import { type UsersCommandsServices } from '../ports/commands';

export function createUsersCommandsRouter(services: UsersCommandsServices) {
	const maxAvatarUploadBytes = Number(
		process.env.MAX_AVATAR_UPLOAD_BYTES ?? 5_000_000,
	);
	return new Elysia({ prefix: '/users' })
		.post(
			'/',
			async ({ body, set }) => {
				const result = await services.createUser({ data: body });
				set.status = 201;
				return result;
			},
			{
				body: CreateUserSchema,
				response: {
					201: FullUserSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Create User',
					description: 'Creates a new user.',
					tags: ['Users Management'],
				},
			},
		)
		.post(
			'/avatar/upload-url',
			({ body }) => {
				return services.requestAvatarUploadUrl({
					requesterId: 'guest',
					contentType: body.contentType,
					contentLength: body.contentLength,
				});
			},
			{
				body: t.Object({
					contentType: t.String(),
					contentLength: t.Optional(
						t.Number({
							minimum: 1,
							maximum: maxAvatarUploadBytes,
							...makeValidationError(
								`Content length must be between 1 and ${maxAvatarUploadBytes} bytes`,
							),
						}),
					),
				}),
				response: {
					200: AvatarUploadUrlSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Request Avatar Upload URL',
					description: 'Generates a signed URL for avatar uploads.',
					tags: ['Users Management'],
				},
			},
		)
		.use(authPlugin)
		.patch(
			'/:id',
			({ params, body, auth }) => {
				return services.updateUser({
					requesterId: auth.clientId,
					requesterStatus: auth.clientStatus,
					targetId: params.id,
					data: body,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: UpdateUserBodySchema,
				response: {
					200: FullUserSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Update User',
					description: 'Updates user data.',
					tags: ['Users Management'],
				},
			},
		);
}
