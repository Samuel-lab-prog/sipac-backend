import { CORS_ORIGINS, HAS_CROSS_SITE_CORS } from './variables';
import { originMatchesAllowlist } from '../utils/origin';

const NODE_ENV = process.env.NODE_ENV || 'development';

/** CORS config for Elysia with credentials and origin allowlist. */
export const corsConfig = {
	credentials: true,
	allowedHeaders: [
		'content-type',
		'authorization',
		'x-csrf-token',
		'x-requested-with',
	] as string[],
	origin: (request: Request) => {
		const origin = request.headers.get('origin') ?? '';
		if (!origin) return true;
		if (CORS_ORIGINS.length === 0) return NODE_ENV !== 'production';
		return originMatchesAllowlist(origin, CORS_ORIGINS);
	},
};

/** Returns true when any cross-site CORS origin is configured. */
export function hasCrossSiteCors(): boolean {
	return HAS_CROSS_SITE_CORS;
}
