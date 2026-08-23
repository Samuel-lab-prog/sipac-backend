import { appErrorSchema } from '@AppError';
import { ForbiddenError } from '@DomainError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	avatarUploadRequestSchema,
	avatarUploadResponseSchema,
	changePasswordSchema,
	createUserSchema,
	setAvatarSchema,
	updateUserParamsSchema,
	updateUserSchema,
	userIdParamsSchema,
	createdUserSchema,
	userSchema,
} from '../ports/schemas';
import type { AvatarUploadUrlResult } from '@SharedKernel/ports/storage';
import type {
	ChangePasswordParams,
	CreateAvatarUploadUrlParams,
	DeleteUserParams,
	RestoreUserParams,
	SetAvatarParams,
	UpdateCurrentUserParams,
	UpdateUserParams,
	CreateUserParams,
} from '../ports/commands';
import type { CreatedUser, User } from '../ports/models';

type UsersAuthenticatedCommandsServices = {
	createUser(params: CreateUserParams): Promise<CreatedUser>;
	updateUser(params: UpdateUserParams): Promise<User>;
	updateCurrentUser(params: UpdateCurrentUserParams): Promise<User>;
	createAvatarUploadUrl(
		params: CreateAvatarUploadUrlParams,
	): Promise<AvatarUploadUrlResult>;
	setAvatar(params: SetAvatarParams): Promise<User>;
	changePassword(params: ChangePasswordParams): Promise<User>;
	deleteUser(params: DeleteUserParams): Promise<User>;
	restoreUser(params: RestoreUserParams): Promise<User>;
};

export function createUsersAuthenticatedCommandsRouter(
	services: UsersAuthenticatedCommandsServices,
) {
	return new Elysia({ prefix: '/users' })
		.use(authPlugin)
		.post(
			'/',
			async ({ body, auth, set }) => {
				if (auth.clientRole !== 'admin' && auth.clientRole !== 'staff')
					throw new ForbiddenError(
						'You are not allowed to perform this action',
					);

				const result = await services.createUser({ data: body });
				set.status = 201;
				return result;
			},
			{
				body: createUserSchema,
				response: {
					201: createdUserSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create User',
					tags: ['Users Management'],
				},
			},
		)
		.put(
			'/me',
			({ body, auth }) =>
				services.updateCurrentUser({
					...auth,
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
		.post(
			'/me/avatar/upload-url',
			({ body, auth }) =>
				services.createAvatarUploadUrl({
					data: body,
					...auth,
				}),
			{
				body: avatarUploadRequestSchema,
				response: {
					200: avatarUploadResponseSchema,
					401: appErrorSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Create Avatar Upload URL',
					tags: ['Users Management'],
				},
			},
		)
		.put(
			'/me/avatar',
			({ body, auth }) =>
				services.setAvatar({
					data: body,
					...auth,
				}),
			{
				body: setAvatarSchema,
				response: {
					200: userSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
				detail: { summary: 'Set Avatar', tags: ['Users Management'] },
			},
		)
		.put(
			'/me/password',
			({ body, auth }) =>
				services.changePassword({
					data: body,
					...auth,
				}),
			{
				body: changePasswordSchema,
				response: {
					200: userSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
				detail: { summary: 'Change Password', tags: ['Users Management'] },
			},
		)
		.put(
			'/:id',
			({ params, body, auth }) =>
				services.updateUser({
					params,
					data: body,
					...auth,
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
		)
		.delete(
			'/:id',
			({ params, auth }) =>
				services.deleteUser({
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
				detail: { summary: 'Delete User', tags: ['Users Management'] },
			},
		)
		.post(
			'/:id/restore',
			({ params, auth }) =>
				services.restoreUser({
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
				detail: { summary: 'Restore User', tags: ['Users Management'] },
			},
		);
}
