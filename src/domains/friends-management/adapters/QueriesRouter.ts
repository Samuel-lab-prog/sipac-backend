import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import { type QueriesRouterServices } from '../ports/queries';
import { FriendRequestsByUserSchema } from '../ports/schemas/Index';

export function createFriendsQueriesRouter(services: QueriesRouterServices) {
	return new Elysia({ prefix: '/friends' }).use(authPlugin).get(
		'/requests',
		({ auth }) => {
			return services.getMyFriendRequests({
				requesterId: auth.clientId,
			});
		},
		{
			response: {
				200: FriendRequestsByUserSchema,
			},
			detail: {
				summary: 'Get My Friend Requests',
				description:
					'Returns friend requests sent and received by the authenticated user.',
				tags: ['Friends Management'],
			},
		},
	);
}
