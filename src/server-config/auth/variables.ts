import { parseBoolean } from '../utils/envParsers';

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const CROSS_SITE_COOKIES = parseBoolean({
	value: process.env.CROSS_SITE_COOKIES,
	fallback: false,
});

export const CSRF_ENABLED = parseBoolean({
	value: process.env.CSRF_ENABLED,
	fallback: false,
});

export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export const ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60; // 1 hour
export const REFRESH_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 7; // 7 days
