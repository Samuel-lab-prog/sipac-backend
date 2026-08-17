import { appErrorSchema } from '@AppError';
import { SetupPlugin } from '@GenericSubdomains/utils/security/setupPlugin';
import { Elysia } from 'elysia';
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

				auth.clientRole = client.role;
				auth.clientId = client.id;
				auth.clientStatus = client.status;
			} finally {
				store.authTiming = Math.round(performance.now() - authInitiatedAt);
			}
		},
		response: {
			401: appErrorSchema,
		},
		cookie: cookieTokenSchema,
	});
}
