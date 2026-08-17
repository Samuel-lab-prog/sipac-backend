import { type CookieOptions } from 'elysia';

import { MissingEnvVarError } from '@AppError';
import { hasCrossSiteCors } from '../cors/config';
import {
	COOKIE_DOMAIN,
	CROSS_SITE_COOKIES,
	CSRF_ENABLED,
	NODE_ENV,
} from './variables';

export {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_EXPIRATION_TIME,
} from './variables';

/** Returns true when CSRF protection should be enabled. */
export function isCsrfEnabled(): boolean {
	return CSRF_ENABLED || CROSS_SITE_COOKIES || hasCrossSiteCors();
}

/**
 * Configures auth cookie options for the current environment.
 * Sets httpOnly, secure, SameSite, maxAge, and optional domain.
 */
export function setUpCookieTokenOptions(token: CookieOptions) {
	const isProd = NODE_ENV === 'production';
	const isCrossSite = CROSS_SITE_COOKIES;

	token.httpOnly = true;
	token.path = '/';
	token.maxAge = 60 * 60;
	token.secure = isProd || isCrossSite;
	token.sameSite = isCrossSite ? 'none' : 'lax';

	if (COOKIE_DOMAIN) token.domain = COOKIE_DOMAIN;
}

/**
 * Configures CSRF cookie options for the current environment.
 * Aligns SameSite and secure settings with cross-site usage.
 */
export function setUpCsrfCookieOptions(token: CookieOptions) {
	const isProd = NODE_ENV === 'production';
	const isCrossSite = CROSS_SITE_COOKIES;

	token.httpOnly = false;
	token.path = '/';
	token.maxAge = isProd ? 60 * 60 * 24 * 7 : 60 * 60;
	token.secure = isProd || isCrossSite;
	token.sameSite = isCrossSite ? 'none' : 'lax';

	if (COOKIE_DOMAIN) token.domain = COOKIE_DOMAIN;
}

/**
 * Configures refresh token cookie options for the current environment.
 * Uses a longer lifetime for session continuity.
 */
export function setUpRefreshCookieOptions(token: CookieOptions) {
	const isProd = NODE_ENV === 'production';
	const isCrossSite = CROSS_SITE_COOKIES;

	token.httpOnly = true;
	token.path = '/';
	token.maxAge = 60 * 60 * 24 * 7;
	token.secure = isProd || isCrossSite;
	token.sameSite = isCrossSite ? 'none' : 'lax';

	if (COOKIE_DOMAIN) token.domain = COOKIE_DOMAIN;
}

/**
 * Retrieves the JWT secret key from environment variables.
 * Throws in non-test environments if missing.
 */
export function getJwtSecretKey(): string {
	const key = process.env.JWT_SECRET_KEY;
	if (!key) {
		if (NODE_ENV === 'test') return 'test-secret';
		throw MissingEnvVarError('JWT_SECRET_KEY');
	}
	return key;
}
