import {
	appErrorSchema,
	makeValidationError,
} from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema, paginationLimitSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';

import {
	AuthorPoemReadSchema,
	MyPoemReadSchema,
	PoemCollectionSchema,
	PoemPreviewPageSchema,
	SavedPoemSchema,
} from '../ports/schemas/Index';
import { TagNameSchema } from '../ports/schemas/PoemFieldsSchemas';

import { type QueriesRouterServices } from '../ports/queries';

export function createPoemsQueriesRouter(services: QueriesRouterServices) {
	const PoemTitleSearchSchema = t.String({
		maxLength: 120,
		pattern: '^(?!\\s*$)[\\s\\S]*$',
		...makeValidationError(
			'Search title must be at most 120 characters and not only whitespace',
		),
	});

	return new Elysia({ prefix: '/poems' })
		.get(
			'/',
			({ query }) => {
				return services.searchPoems({
					navigationOptions: {
						limit: query.limit,
						cursor: query.cursor,
					},
					filterOptions: {
						searchTitle: query.searchTitle,
						tags: query.tags,
					},
					sortOptions: {
						orderBy: query.orderBy,
						orderDirection: query.orderDirection,
					},
				});
			},
			{
				response: {
					200: PoemPreviewPageSchema,
				},
				query: t.Object({
					limit: t.Optional(paginationLimitSchema),
					cursor: t.Optional(idSchema),
					searchTitle: t.Optional(PoemTitleSearchSchema),
					tags: t.Optional(
						t.Array(TagNameSchema, {
							maxItems: 5,
							uniqueItems: true,
						}),
					),
					orderBy: t.Optional(
						t.Enum({
							createdAt: 'createdAt',
							title: 'title',
						}),
					),
					orderDirection: t.Optional(
						t.Enum({
							asc: 'asc',
							desc: 'desc',
						}),
					),
				}),

				detail: {
					summary: 'Search Poems',
					description:
						'Returns a paginated list of poems matching the provided filter and sort options.',
					tags: ['Poems Management'],
				},
			},
		)
		.use(authPlugin)
		.get(
			'/me',
			({ auth }) => {
				return services.getMyPoems({
					requesterId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Array(MyPoemReadSchema),
				},
				detail: {
					summary: 'Get My Poems',
					description:
						'Returns the list of poems authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/moderation/pending',
			({ auth, query }) => {
				return services.getPendingPoems({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					navigationOptions: {
						limit: query.limit,
						cursor: query.cursor,
					},
				});
			},
			{
				response: {
					200: t.Array(AuthorPoemReadSchema),
					403: appErrorSchema,
				},
				query: t.Object({
					limit: t.Optional(paginationLimitSchema),
					cursor: t.Optional(idSchema),
				}),
				detail: {
					summary: 'Get Pending Poems',
					description:
						'Returns poems pending moderation for moderators and admins.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'authors/:authorId',
			({ params, auth }) => {
				return services.getAuthorPoems({
					authorId: params.authorId,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: t.Array(AuthorPoemReadSchema),
				},
				params: t.Object({
					authorId: idSchema,
				}),
				detail: {
					summary: "Get Author's Poems",
					description:
						'Returns the list of published public poems authored by the specified author.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/:poemId',
			({ params, auth }) => {
				return services.getPoemById({
					poemId: params.poemId,
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: AuthorPoemReadSchema,
					403: appErrorSchema,
				},
				params: t.Object({
					poemId: idSchema,
				}),
				detail: {
					summary: 'Get Poem by ID',
					description:
						'Returns the poem with the specified ID if the requester has access to it.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/saved',
			({ auth }) => {
				return services.getSavedPoems({
					requesterId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Array(SavedPoemSchema),
				},
				detail: {
					summary: 'Get Saved Poems',
					description:
						'Returns the list of poems saved by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.get(
			'/collections',
			({ auth }) => {
				return services.getCollections({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
				});
			},
			{
				response: {
					200: t.Array(PoemCollectionSchema),
				},
				detail: {
					summary: 'Get Collections',
					description:
						'Returns the list of poem collections belonging to the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		);
}
