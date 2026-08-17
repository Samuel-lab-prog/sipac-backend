import {
	appErrorSchema,
	makeValidationError,
} from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';

import {
	CreateCollectionSchema,
	CreatePoemBodySchema,
	CreatePoemResultSchema,
	PoemAudioUpdateBodySchema,
	PoemAudioUploadUrlSchema,
	UpdatePoemBodySchema,
	UpdatePoemResultSchema,
} from '../ports/schemas/Index';

import { type CommandsRouterServices } from '../ports/commands';

export function createPoemsCommandsRouter(services: CommandsRouterServices) {
	const maxPoemAudioUploadBytes = Number(
		process.env.MAX_POEM_AUDIO_UPLOAD_BYTES ?? 20_000_000,
	);
	return new Elysia({ prefix: '/poems' })
		.use(authPlugin)
		.post(
			'/',
			async ({ auth, body, set }) => {
				const rs = await services.createPoem({
					data: body,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
				set.status = 201;
				return rs;
			},
			{
				response: {
					201: CreatePoemResultSchema,
					409: appErrorSchema,
				},
				body: CreatePoemBodySchema,
				detail: {
					summary: 'Create Poem',
					description: 'Creates a new poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.put(
			'/:id',
			({ auth, body, params }) => {
				return services.updatePoem({
					data: body,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
					poemId: params.id,
				});
			},
			{
				response: {
					200: UpdatePoemResultSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: UpdatePoemBodySchema,
				detail: {
					summary: 'Update Poem',
					description:
						'Updates an existing poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/:id',
			({ auth, params }) => {
				return services.deletePoem({
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
					poemId: params.id,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Delete Poem',
					description:
						'Deletes an existing poem authored by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.post(
			'/:id/audio/upload-url',
			({ auth, params, body }) => {
				return services.requestPoemAudioUploadUrl({
					poemId: params.id,
					contentType: body.contentType,
					contentLength: body.contentLength,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				body: t.Object({
					contentType: t.String(),
					contentLength: t.Optional(
						t.Number({
							minimum: 1,
							maximum: maxPoemAudioUploadBytes,
							...makeValidationError(
								`Content length must be between 1 and ${maxPoemAudioUploadBytes} bytes`,
							),
						}),
					),
				}),
				response: {
					200: PoemAudioUploadUrlSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					422: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Request Poem Audio Upload URL',
					description: 'Generates a signed URL for poem audio uploads.',
					tags: ['Poems Management'],
				},
			},
		)
		.patch(
			'/:id/audio',
			({ auth, params, body }) => {
				return services.updatePoemAudio({
					poemId: params.id,
					audioUrl: body.audioUrl,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				body: PoemAudioUpdateBodySchema,
				response: {
					200: PoemAudioUpdateBodySchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Update Poem Audio',
					description:
						'Updates the poem audio URL for the authenticated author.',
					tags: ['Poems Management'],
				},
			},
		)
		.post(
			'/:id/save',
			({ auth, params }) => {
				return services.savePoem({
					poemId: params.id,
					userId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Save Poem',
					description:
						"Saves a poem to the authenticated user's saved poems list.",
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/:id/save',
			({ auth, params }) => {
				return services.removeSavedPoem({
					poemId: params.id,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Remove Saved Poem',
					description:
						"Removes a poem from the authenticated user's saved poems list.",
					tags: ['Poems Management'],
				},
			},
		)
		.post(
			'/collections',
			({ auth, body }) => {
				return services.createCollection({
					data: body,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
				},
				body: CreateCollectionSchema,
				detail: {
					summary: 'Create Collection',
					description:
						'Creates a new poem collection for the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.post(
			'/collections/:id/items',
			({ auth, params, body }) => {
				return services.addItemToCollection({
					collectionId: params.id,
					poemId: body.poemId,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					poemId: idSchema,
				}),
				detail: {
					summary: 'Add Item to Collection',
					description:
						'Adds a poem to a poem collection owned by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/collections/:id/items',
			({ auth, params, body }) => {
				return services.removeItemFromCollection({
					collectionId: params.id,
					poemId: body.poemId,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					poemId: idSchema,
				}),
				detail: {
					summary: 'Remove Item from Collection',
					description:
						'Removes a poem from a poem collection owned by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		)
		.delete(
			'/collections/:id',
			({ auth, params }) => {
				return services.deleteCollection({
					collectionId: params.id,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Delete Collection',
					description:
						'Deletes a poem collection owned by the authenticated user.',
					tags: ['Poems Management'],
				},
			},
		);
}
