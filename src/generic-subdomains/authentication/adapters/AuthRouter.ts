import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import {
	CSRF_COOKIE_NAME,
	setUpCookieTokenOptions,
	setUpCsrfCookieOptions,
	setUpRefreshCookieOptions,
} from 'server-config/config';
import { SetupPlugin } from '../../utils/security/setup-plugin';
import type { AuthControllerServices } from '../ports/externalServices';
import {
	authClientSchema,
	loginSchema,
	refreshCookieTokenSchema,
} from '../ports/schemas/Index';

export function createAuthRouter(services: AuthControllerServices) {
	const { login, refreshSession } = services;

	return new Elysia({ prefix: '/auth' })
		.use(SetupPlugin)
		.post(
			'/login',
			async ({ body, cookie, auth }) => {
				const result = await login({
					email: body.email,
					password: body.password,
				});

				cookie.token!.value = result.accessToken;
				setUpCookieTokenOptions(cookie.token!);

				cookie.refreshToken!.value = result.refreshToken;
				setUpRefreshCookieOptions(cookie.refreshToken!);

				const csrfToken = crypto.randomUUID();
				cookie[CSRF_COOKIE_NAME]!.value = csrfToken;
				setUpCsrfCookieOptions(cookie[CSRF_COOKIE_NAME]!);

				auth.clientId = result.client.id;
				auth.clientRole = result.client.role as typeof auth.clientRole;
				auth.clientStatus = result.client.status as typeof auth.clientStatus;

				return result.client;
			},
			{
				body: loginSchema,
				response: {
					200: authClientSchema,
					400: appErrorSchema,
					401: appErrorSchema,
				},
				detail: {
					summary: 'Login',
					description:
						'Authenticates a user and returns access/refresh tokens in HTTP-only cookies.',
					tags: ['Auth'],
				},
			},
		)
		.post(
			'/refresh',
			async ({ cookie, auth }) => {
				const refreshToken = cookie.refreshToken!.value;
				const result = await refreshSession(refreshToken);

				cookie.token!.value = result.accessToken;
				setUpCookieTokenOptions(cookie.token!);

				cookie.refreshToken!.value = result.refreshToken;
				setUpRefreshCookieOptions(cookie.refreshToken!);

				auth.clientId = result.client.id;
				auth.clientRole = result.client.role as typeof auth.clientRole;
				auth.clientStatus = result.client.status as typeof auth.clientStatus;

				return result.client;
			},
			{
				cookie: refreshCookieTokenSchema,
				response: {
					200: authClientSchema,
					401: appErrorSchema,
				},
				detail: {
					summary: 'Refresh session',
					description:
						'Refreshes access and refresh tokens using the refresh token cookie.',
					tags: ['Auth'],
				},
			},
		);
}
