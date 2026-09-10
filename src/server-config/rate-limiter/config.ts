import type { Server } from 'bun';
import { AppError } from '@AppError';
import {
	HAS_TRUSTED_PROXY_IPS,
	RATE_LIMIT_MAX,
	RATE_LIMIT_DURATION_MS,
	RATE_LIMIT_HEADERS,
	RATE_LIMIT_CONTEXT_SIZE,
	RATE_LIMIT_ERROR_JSON,
	RATE_LIMIT_SKIP_PATHS,
	AUTH_RATE_LIMIT_MAX,
	AUTH_RATE_LIMIT_DURATION_MS,
	TRUST_PROXY,
} from './variables';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

export type RateLimitSettings = {
	max: number;
	duration: number;
	headers: boolean;
	contextSize: number;
	countFailedRequest: boolean;
	generator: (request: Request, server: Server<null> | null) => string;
	errorResponse: Response | string;
	skip: (request: Request, clientKey?: string) => boolean;
};

/** Builds a rate-limit key using client IP (proxy-aware). */
function getRateLimitKey(
	request: Request,
	server: Server<null> | null,
): string {
	// If behind a trusted proxy, prefer the forwarded client IP (first hop).
	if (TRUST_PROXY && Array.isArray(HAS_TRUSTED_PROXY_IPS)) {
		const directIp = server?.requestIP(request)?.address ?? '';
		const isTrustedProxy = HAS_TRUSTED_PROXY_IPS.includes(directIp);
		if (isTrustedProxy) {
			const forwardedFor = request.headers.get('x-forwarded-for');
			const cfConnectingIp = request.headers.get('cf-connecting-ip');
			const clientIp =
				(forwardedFor ?? '')
					.split(',')
					.map((ip) => ip.trim())
					.filter(Boolean)[0] ??
				cfConnectingIp ??
				directIp;
			if (clientIp) return clientIp;
		}
	}
	// Fallback: direct IP from the server.
	return server?.requestIP(request)?.address ?? 'unknown';
}

/** Builds the rate-limit exceeded response. */
function buildRateLimitErrorResponse(): Response | string {
	if (!RATE_LIMIT_ERROR_JSON) return 'rate-limit reached';
	return new Response(
		JSON.stringify({
			message: 'rate-limit reached',
			statusCode: 429,
			code: 'RATE_LIMIT_EXCEEDED',
			name: 'AppError',
		} satisfies AppError),
		{
			status: 429,
			headers: new Headers({ 'Content-Type': 'application/json' }),
		},
	);
}

/** Returns true when a request should skip rate limiting. */
function skipRateLimit(request: Request): boolean {
	if (NODE_ENV === 'test') return true;
	if (request.method === 'OPTIONS') return true;

	const pathname = new URL(request.url).pathname;
	return RATE_LIMIT_SKIP_PATHS.some((path) => pathname.startsWith(path));
}

/** Global rate limit settings. */
export const RATE_LIMIT_SETTINGS = {
	max: RATE_LIMIT_MAX,
	duration: RATE_LIMIT_DURATION_MS,
	headers: RATE_LIMIT_HEADERS,
	contextSize: RATE_LIMIT_CONTEXT_SIZE,
	countFailedRequest: false,
	generator: getRateLimitKey,
	errorResponse: buildRateLimitErrorResponse(),
	skip: (request: Request) => skipRateLimit(request),
} satisfies RateLimitSettings;

/** Auth-specific rate limit settings. */
export const AUTH_RATE_LIMIT_SETTINGS = {
	max: AUTH_RATE_LIMIT_MAX,
	duration: AUTH_RATE_LIMIT_DURATION_MS,
	headers: RATE_LIMIT_HEADERS,
	countFailedRequest: true,
	contextSize: RATE_LIMIT_CONTEXT_SIZE,
	generator: getRateLimitKey,
	errorResponse: buildRateLimitErrorResponse(),
	skip: (request: Request) => skipRateLimit(request),
} satisfies RateLimitSettings;
