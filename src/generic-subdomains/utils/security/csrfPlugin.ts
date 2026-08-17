import Elysia from 'elysia';
import { AppError } from '@AppError';
import {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	API_URL_PREFIX,
	isCsrfEnabled,
} from 'server-config/config';
import { originMatchesAllowlist } from 'server-config/utils/origin';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_SKIP_PATHS = [`${API_URL_PREFIX}/auth/login`];

const CSRF_SKIP_PATHS = (process.env.CSRF_SKIP_PATHS ?? '')
	.split(',')
	.map((p) => p.trim())
	.filter(Boolean);

const CSRF_ORIGIN_ALLOWLIST = (process.env.CSRF_ORIGIN_ALLOWLIST ?? '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const BOOTSTRAP_PATH = `${API_URL_PREFIX}/internal/bootstrap-admin`;
const BOOTSTRAP_HEADER = 'x-bootstrap-secret';
const BOOTSTRAP_SECRET = process.env.BOOTSTRAP_SECRET ?? '';
const BOOTSTRAP_ALLOWED_IPS = (process.env.BOOTSTRAP_ALLOWED_IPS ?? '')
	.split(',')
	.map((ip) => ip.trim())
	.filter(Boolean);

function getClientIp(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for') ?? '';
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-real-ip') ??
		request.headers.get('x-client-ip') ??
		''
	);
}

function isOriginAllowed(origin: string): boolean {
	if (!origin) return false;
	if (CSRF_ORIGIN_ALLOWLIST.length === 0) return true;
	return originMatchesAllowlist(origin, CSRF_ORIGIN_ALLOWLIST);
}

function shouldSkip(pathname: string): boolean {
	return DEFAULT_SKIP_PATHS.concat(CSRF_SKIP_PATHS).some((path) =>
		pathname.startsWith(path),
	);
}

export const CsrfPlugin = new Elysia().onBeforeHandle(({ request, cookie }) => {
	if (!isCsrfEnabled()) return;
	if (SAFE_METHODS.has(request.method)) return;

	const pathname = new URL(request.url).pathname;
	if (
		pathname.startsWith(BOOTSTRAP_PATH) &&
		BOOTSTRAP_SECRET &&
		request.headers.get(BOOTSTRAP_HEADER) === BOOTSTRAP_SECRET
	) {
		const clientIp = getClientIp(request);
		if (
			clientIp &&
			BOOTSTRAP_ALLOWED_IPS.length > 0 &&
			BOOTSTRAP_ALLOWED_IPS.includes(clientIp)
		) {
			return;
		}
	}
	if (shouldSkip(pathname)) return;

	const origin =
		request.headers.get('origin') ?? request.headers.get('referer') ?? '';
	let originHost = '';
	if (origin) {
		try {
			originHost = new URL(origin).origin;
		} catch {
			originHost = '';
		}
	}
	if (!isOriginAllowed(originHost)) {
		throw new AppError({
			statusCode: 403,
			message: 'CSRF origin is not allowed',
			code: 'FORBIDDEN',
		});
	}

	const headerToken = request.headers.get(CSRF_HEADER_NAME) ?? '';
	const cookieToken = cookie[CSRF_COOKIE_NAME]?.value ?? '';

	if (!headerToken || !cookieToken || headerToken !== cookieToken) {
		throw new AppError({
			statusCode: 403,
			message: 'CSRF token is missing or invalid',
			code: 'FORBIDDEN',
		});
	}
});
