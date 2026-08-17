import { MissingEnvVarError } from '@AppError';
import { parseBoolean, parseCsv, parseNumber } from '../utils/envParsers';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_PROD = NODE_ENV === 'production';
/** Whether to trust proxy headers for client IP detection. */
export const TRUST_PROXY = parseBoolean({
	value: process.env.TRUST_PROXY,
	fallback: false,
});
/** Trusted proxy IP allowlist. */
export const TRUSTED_PROXY_IPS = parseCsv({
	value: process.env.TRUSTED_PROXY_IPS,
});
/** Max auth attempts per window. */
export const AUTH_RATE_LIMIT_MAX = parseNumber({
	name: 'AUTH_RATE_LIMIT_MAX',
	value: process.env.AUTH_RATE_LIMIT_MAX,
	fallback: 20,
	min: 1,
});
/** Auth rate limit window (ms). */
export const AUTH_RATE_LIMIT_DURATION_MS = parseNumber({
	name: 'AUTH_RATE_LIMIT_DURATION_MS',
	value: process.env.AUTH_RATE_LIMIT_DURATION_MS,
	fallback: 15 * 60 * 1000,
	min: 1_000,
});
/** Max requests per window (global). */
export const RATE_LIMIT_MAX = parseNumber({
	name: 'RATE_LIMIT_MAX',
	value: process.env.RATE_LIMIT_MAX,
	fallback: 1000,
	min: 1,
});
/** Global rate limit window (ms). */
export const RATE_LIMIT_DURATION_MS = parseNumber({
	name: 'RATE_LIMIT_DURATION_MS',
	value: process.env.RATE_LIMIT_DURATION_MS,
	fallback: 15 * 60 * 1000,
	min: 1_000,
});
/** Whether to include rate limit headers. */
export const RATE_LIMIT_HEADERS = parseBoolean({
	value: process.env.RATE_LIMIT_HEADERS,
	fallback: true,
});
/** Context size for rate limiter storage. */
export const RATE_LIMIT_CONTEXT_SIZE = parseNumber({
	name: 'RATE_LIMIT_CONTEXT_SIZE',
	value: process.env.RATE_LIMIT_CONTEXT_SIZE,
	fallback: 10_000,
	min: 1,
});
/** Whether to return JSON on rate limit exceeded. */
export const RATE_LIMIT_ERROR_JSON = parseBoolean({
	value: process.env.RATE_LIMIT_ERROR_JSON,
	fallback: true,
});
/** Paths to skip for rate limiting. */
export const RATE_LIMIT_SKIP_PATHS =
	process.env.RATE_LIMIT_SKIP_PATHS === undefined
		? ['/health', '/metrics']
		: parseCsv({ value: process.env.RATE_LIMIT_SKIP_PATHS });
/** True when any trusted proxy IP is configured. */
export const HAS_TRUSTED_PROXY_IPS = TRUSTED_PROXY_IPS.length > 0;

if (TRUST_PROXY && !HAS_TRUSTED_PROXY_IPS) {
	if (IS_PROD) {
		throw MissingEnvVarError('TRUSTED_PROXY_IPS');
	}
	console.warn(
		'TRUST_PROXY=true but TRUSTED_PROXY_IPS is empty. Falling back to direct client IPs.',
	);
}
