import { makeUnauthorizedError } from '@AppError';
import { t } from 'elysia';

export const cookieTokenSchema = t.Cookie(
	{
		token: t.String(),
	},
	{
		...makeUnauthorizedError('Missing or invalid authentication token'),
	},
);
