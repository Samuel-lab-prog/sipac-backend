import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { ForbiddenError } from '@DomainError';
import { Elysia } from 'elysia';
import type { CommunicationsCommandsServices } from '../ports/queries';
import { announcementBaseSchema, createAnnouncementSchema } from '../ports/schemas';

export function createCommunicationsCommandsRouter(
	services: CommunicationsCommandsServices,
) {
	return new Elysia({ prefix: '/communications' })
		.use(authPlugin)
		.post(
			'/announcements',
			async ({ body, auth, set }) => {
				if (auth.clientRole !== 'staff' && auth.clientRole !== 'admin') {
					throw new ForbiddenError('You are not allowed to perform this action');
				}

				set.status = 201;
				return services.createAnnouncement({
					...body,
					publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
					expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
				});
			},
			{
				body: createAnnouncementSchema,
				response: {
					201: announcementBaseSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Announcement',
					tags: ['Communications Management'],
				},
			},
		);
}
