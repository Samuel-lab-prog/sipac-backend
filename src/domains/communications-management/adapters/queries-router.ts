import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type { SetupPluginContext } from '@GenericSubdomains/utils/security/setup-plugin';
import type { CommunicationsQueriesServices } from '../ports/queries';

export function createCommunicationsQueriesRouter(
	services: CommunicationsQueriesServices,
) {
	const listMyAnnouncements = ({ auth }: SetupPluginContext) =>
		services.listAnnouncementsForUser(auth.clientId, auth.clientRole);

	return new Elysia({ prefix: '/communications' })
		.use(authPlugin)
		.get('/announcements/me', listMyAnnouncements, {
			response: {
				200: t.Any(),
				401: appErrorSchema,
			},
			detail: {
				summary: 'List My Announcements',
				tags: ['Communications Management'],
			},
		});
}
