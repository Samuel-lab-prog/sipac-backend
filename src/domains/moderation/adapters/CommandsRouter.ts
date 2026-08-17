import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { idSchema } from '@SharedKernel/Schemas';
import { Elysia, t } from 'elysia';
import { type CommandsRouterServices } from '../ports/commands';
import {
	bannedUserResponseSchema,
	ModeratePoemBodySchema,
	ModeratePoemResultSchema,
	sanctionReasonSchema,
	suspendedUserResponseSchema,
	suspensionDurationDaysSchema,
} from '../ports/schemas/Index';

export function createModerationCommandsRouter(
	services: CommandsRouterServices,
) {
	return new Elysia({ prefix: '/moderation' })
		.use(authPlugin)
		.post(
			'/ban/:id',
			({ auth, params, body }) => {
				return services.banUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					userId: params.id,
					reason: body.reason,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					reason: sanctionReasonSchema,
				}),
				response: {
					200: bannedUserResponseSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Ban User',
					description: 'Bans a user by the authenticated moderator.',
					tags: ['Moderation'],
				},
			},
		)
		.post(
			'/suspend/:id',
			({ auth, params, body }) => {
				return services.suspendUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					userId: params.id,
					reason: body.reason,
					durationDays: body.durationDays,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				body: t.Object({
					reason: sanctionReasonSchema,
					durationDays: t.Optional(suspensionDurationDaysSchema),
				}),
				response: {
					200: suspendedUserResponseSchema,
					404: appErrorSchema,
					409: appErrorSchema,
				},
				detail: {
					summary: 'Suspend User',
					description: 'Suspends a user by the authenticated moderator.',
					tags: ['Moderation'],
				},
			},
		)
		.post(
			'/unban/:id',
			({ auth, params }) => {
				return services.unbanUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					userId: params.id,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Unban User',
					description: 'Removes an active ban from a user.',
					tags: ['Moderation'],
				},
			},
		)
		.post(
			'/unsuspend/:id',
			({ auth, params }) => {
				return services.unsuspendUser({
					requesterId: auth.clientId,
					requesterRole: auth.clientRole,
					requesterStatus: auth.clientStatus,
					userId: params.id,
				});
			},
			{
				params: t.Object({
					id: idSchema,
				}),
				response: {
					200: t.Void(),
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Unsuspend User',
					description: 'Removes an active suspension from a user.',
					tags: ['Moderation'],
				},
			},
		)
		.patch(
			'/poems/:id',
			({ auth, params, body }) => {
				return services.moderatePoem({
					poemId: params.id,
					moderationStatus: body.moderationStatus,
					reason: body.reason,
					meta: {
						requesterId: auth.clientId,
						requesterStatus: auth.clientStatus,
						requesterRole: auth.clientRole,
					},
				});
			},
			{
				response: {
					200: ModeratePoemResultSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				body: ModeratePoemBodySchema,
				detail: {
					summary: 'Moderate Poem',
					description:
						'Updates the moderation status of a poem for moderators or admins.',
					tags: ['Moderation'],
				},
			},
		);
}
