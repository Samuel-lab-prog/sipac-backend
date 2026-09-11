import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import { SetupPlugin } from '../../utils/security/setup-plugin';
import type { authPluginServices } from '../ports/externalServices';
import { cookieTokenSchema } from '../ports/schemas';

export function createAuthPlugin({ authenticate }: authPluginServices) {
	return new Elysia().use(SetupPlugin).guard({
		as: 'scoped',
		beforeHandle: async (context) => {
			const { cookie, store } = context;
			const authInitiatedAt = performance.now();
			try {
				const token = cookie.token.value;
				const client = await authenticate(token);
				// Each request owns its identity; never mutate the shared Elysia decorator.
				context.auth = {
					clientRole: client.role as typeof context.auth.clientRole,
					clientId: client.id,
					clientStatus: client.status as typeof context.auth.clientStatus,
				};
			} finally {
				store.authTiming = Math.round(performance.now() - authInitiatedAt);
			}
		},
		response: { 401: appErrorSchema },
		cookie: cookieTokenSchema,
	});
}
