import {
	appErrorSchema,
	makeValidationError,
} from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';
import {
	EmailSchema,
	NicknameSchema,
} from '../ports/schemas/UserFieldsSchemas';

import {
	UserProfileSchema,
	UsersPageSchema,
	orderDirectionSchema,
	orderUsersBySchema,
	paginationLimitSchema,
} from '../ports/schemas/Index';

import { type UsersQueriesRouterServices } from '../ports/queries';

export function createUsersReadRouter(services: UsersQueriesRouterServices) {
	const NicknameSearchSchema = t.String({
		maxLength: 32,
		pattern: '^[a-zA-Z0-9_]*$',
		...makeValidationError(
			'Nickname search must be at most 32 characters and contain only letters, numbers, and underscores',
		),
	});

	return new Elysia({ prefix: '/users' })
		.get(
			'/check-nickname',
			({ query }) => {
				return services.checkNickanmeAvailability(query.nickname);
			},
			{
				response: {
					200: t.Boolean(),
				},
				query: t.Object({
					nickname: NicknameSchema,
				}),
				detail: {
					summary: 'Check Nickname Availability',
					description:
						'Checks if a given nickname is available for registration.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/public',
			({ query }) => {
				const { limit, searchNickname } = query;
				return services.searchUsers({
					requesterStatus: 'active',
					navigationOptions: {
						limit,
						cursor: undefined,
					},
					sortOptions: {
						by: 'nickname',
						order: 'asc',
					},
					filterOptions: {
						searchNickname,
						status: 'active',
					},
				});
			},
			{
				response: {
					200: UsersPageSchema,
				},
				query: t.Object({
					limit: paginationLimitSchema,
					searchNickname: t.Optional(NicknameSearchSchema),
				}),
				detail: {
					summary: 'Get Public Authors',
					description: 'Returns a public list of active authors.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/check-email',
			({ query }) => {
				return services.checkEmailAvailability(query.email);
			},
			{
				response: {
					200: t.Boolean(),
				},
				query: t.Object({
					email: EmailSchema,
				}),
				detail: {
					summary: 'Check Email Availability',
					description: 'Checks if a given email is available for registration.',
					tags: ['Users Management'],
				},
			},
		)
		.use(authPlugin)
		.get(
			'/preview',
			({ query, auth }) => {
				const { limit, searchNickname } = query;
				return services.searchUsers({
					requesterStatus: auth.clientStatus,
					navigationOptions: {
						limit,
						cursor: undefined,
					},
					sortOptions: {
						by: 'nickname',
						order: 'asc',
					},
					filterOptions: {
						searchNickname,
						status: 'active',
					},
				});
			},
			{
				response: {
					200: UsersPageSchema,
				},
				query: t.Object({
					limit: paginationLimitSchema,
					searchNickname: t.Optional(NicknameSearchSchema),
				}),
				detail: {
					summary: 'Get Users Preview',
					description: 'Returns a lightweight preview list of active users.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/',
			({ query, auth }) => {
				const { limit, cursor, orderBy, orderDirection, searchNickname } =
					query;
				return services.searchUsers({
					requesterStatus: auth.clientStatus,
					navigationOptions: {
						limit,
						cursor,
					},
					sortOptions: {
						by: orderBy,
						order: orderDirection,
					},
					filterOptions: {
						searchNickname,
					},
				});
			},
			{
				response: {
					200: UsersPageSchema,
				},
				query: t.Object({
					limit: paginationLimitSchema,
					cursor: t.Optional(idSchema),
					orderBy: orderUsersBySchema,
					orderDirection: orderDirectionSchema,
					searchNickname: t.Optional(NicknameSearchSchema),
				}),
				detail: {
					summary: 'Get Users',
					description: 'Returns a paginated list of users.',
					tags: ['Users Management'],
				},
			},
		)
		.get(
			'/:id/profile',
			({ params, auth }) => {
				return services.getProfile({
					id: params.id,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: UserProfileSchema,
					404: appErrorSchema,
					422: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),

				detail: {
					summary: 'Get User Profile',
					description:
						'Returns a user profile (public or private) by their ID.',
					tags: ['Users Management'],
				},
			},
		);
}
