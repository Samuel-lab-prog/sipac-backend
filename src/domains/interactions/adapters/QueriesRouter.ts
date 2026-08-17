import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';

import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentsPageSchema } from '../ports/schemas/PoemCommentsPageSchema';

import { appErrorSchema } from '@AppError';
import { type QueriesRouterServices } from '../ports/queries';

export function createInteractionsQueriesRouter(
	services: QueriesRouterServices,
) {
	return new Elysia({ prefix: '/interactions' }).use(authPlugin).get(
		'/poems/:id/comments',
		({ params, auth, query }) => {
			return services.getPoemComments({
				poemId: params.id,
				userId: auth.clientId,
				parentId: query.parentId,
				cursor: query.cursor,
				limit: query.limit,
			});
		},
		{
			params: t.Object({
				id: idSchema,
			}),
			query: t.Object({
				parentId: t.Optional(idSchema),
				cursor: t.Optional(idSchema),
				limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
			}),
			response: {
				200: PoemCommentsPageSchema,
				404: appErrorSchema,
				409: appErrorSchema,
			},
			detail: {
				summary: 'Get Poem Comments',
				description: 'Retrieves comments for a poem.',
				tags: ['Interactions'],
			},
		},
	);
}
