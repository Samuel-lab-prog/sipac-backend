import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import { SetupPlugin } from '../../utils/security/setup-plugin';
import type { authPluginServices } from '../ports/externalServices';
import { cookieTokenSchema } from '../ports/schemas';

export function createAuthPlugin({ authenticate }: authPluginServices) {
	return new Elysia().use(SetupPlugin).guard({
		as: 'scoped',
		beforeHandle: async ({ cookie, store, auth }) => {
			const authInitiatedAt = performance.now();
			try {
				const token = cookie.token.value;
				const client = await authenticate(token);
				auth.clientRole = client.role as typeof auth.clientRole;
				auth.clientId = client.id;
				auth.clientStatus = client.status as typeof auth.clientStatus;
			} finally {
				store.authTiming = Math.round(performance.now() - authInitiatedAt);
			}
		},
		response: { 401: appErrorSchema },
		cookie: cookieTokenSchema,
	});
}
