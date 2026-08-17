import { MissingEnvVarError } from '@AppError';
import { parseBoolean, parseCsv } from '../utils/envParsers';

const NODE_ENV = process.env.NODE_ENV || 'development';

export const CROSS_SITE_COOKIES = parseBoolean({
	value: process.env.CROSS_SITE_COOKIES,
	fallback: false,
});

/**
 * Fallback single-origin when CORS_ORIGIN is not set.
 * Ignored when CORS_ORIGIN is provided.
 */
export const FRONTEND_URL = (process.env.FRONTEND_URL ?? '').trim();

/**
 * Comma-separated allowlist of CORS origins.
 * In production, missing origins block cross-site requests.
 */
const RAW_CORS_ORIGINS = (process.env.CORS_ORIGIN ?? '').trim();
const EFFECTIVE_CORS_ORIGINS = RAW_CORS_ORIGINS || FRONTEND_URL;

export const CORS_ORIGINS = parseCsv({ value: EFFECTIVE_CORS_ORIGINS });
export const HAS_CROSS_SITE_CORS = !!FRONTEND_URL || CORS_ORIGINS.length > 0;

if (NODE_ENV === 'production' && CORS_ORIGINS.length === 0) {
	// Avoid logger import here to prevent circular deps with server-config.
	const warning =
		'Missing CORS_ORIGIN/FRONTEND_URL in production. Cross-site requests will be blocked.';
	console.warn(warning);
	if (CROSS_SITE_COOKIES) {
		throw MissingEnvVarError('CORS_ORIGIN');
	}
}
