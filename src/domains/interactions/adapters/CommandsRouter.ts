import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';

import { idSchema } from '@SharedKernel/Schemas';

import { appErrorSchema } from '@AppError';
import { type CommandsRouterServices } from '../ports/commands';
import { CommentContentSchema } from '../ports/schemas/Index';

export function createInteractionsCommandsRouter(
	services: CommandsRouterServices,
) {
	return new Elysia({ prefix: '/interactions' })
		.use(authPlugin)
		.post(
			'/poems/:id/like',
			async ({ auth, params, set }) => {
				const rs = await services.likePoem({
					userId: auth.clientId,
					poemId: params.id,
				});
				set.status = 201;
				return rs;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					201: t.Void(),
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Like Poem',
					description: 'Adds a like to a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.delete(
			'/poems/:id/like',
			async ({ auth, params, set }) => {
				const rs = await services.unlikePoem({
					userId: auth.clientId,
					poemId: params.id,
				});
				set.status = 204;
				return rs;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
				},
				detail: {
					summary: 'Unlike Poem',
					description: 'Removes a like from a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.post(
			'/poems/:id/comments',
			async ({ auth, params, body, set }) => {
				await services.commentPoem({
					userId: auth.clientId,
					poemId: params.id,
					content: body.content,
					parentId: body.parentId,
				});
				set.status = 201;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					content: CommentContentSchema,
					parentId: t.Optional(idSchema),
				}),

				response: {
					201: t.Void(),
					404: appErrorSchema,
				},
				detail: {
					summary: 'Comment Poem',
					description: 'Adds a comment to a poem by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.delete(
			'/comments/:id',
			async ({ auth, params, set }) => {
				await services.deleteComment({
					userId: auth.clientId,
					commentId: params.id,
				});
				set.status = 204;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Delete Comment',
					description: 'Deletes a comment made by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.post(
			'/comments/:id/like',
			async ({ auth, params, set }) => {
				await services.likeComment({
					userId: auth.clientId,
					commentId: params.id,
				});
				set.status = 201;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					201: t.Void(),
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Like Comment',
					description: 'Adds a like to a comment by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.delete(
			'/comments/:id/like',
			async ({ auth, params, set }) => {
				await services.unlikeComment({
					userId: auth.clientId,
					commentId: params.id,
				});
				set.status = 204;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Unlike Comment',
					description:
						'Removes a like from a comment by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		)
		.patch(
			'/comments/:id',
			async ({ auth, params, body, set }) => {
				await services.patchComment({
					userId: auth.clientId,
					commentId: params.id,
					content: body.content,
				});
				set.status = 204;
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					content: CommentContentSchema,
				}),
				response: {
					204: t.Void(),
					404: appErrorSchema,
					403: appErrorSchema,
				},
				detail: {
					summary: 'Edit Comment',
					description: 'Edits a comment made by the authenticated user.',
					tags: ['Interactions'],
				},
			},
		);
}
