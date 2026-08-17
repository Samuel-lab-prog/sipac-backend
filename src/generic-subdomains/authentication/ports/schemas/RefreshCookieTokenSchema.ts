import { makeUnauthorizedError } from '@AppError';
import { t } from 'elysia';

export const refreshCookieTokenSchema = t.Cookie(
	{
		refreshToken: t.String(),
	},
	{
		...makeUnauthorizedError('Missing or invalid refresh token'),
	},
);
