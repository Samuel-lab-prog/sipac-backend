import { BunAdapter } from 'elysia/adapter/bun';
import { sanitize } from '../generic-subdomains/utils/requests-handling/xss-clean/xss-clean';
import { MissingEnvVarError } from '@AppError';
import { parseNumber } from './utils/envParsers';
import { assertDatabaseSafety } from './utils/databaseSafety';

/** API prefix for all routes. */
export const API_URL_PREFIX = '/api/v1';
/** Elysia instance name. */
export const SERVER_MAIN_INSTANCE_NAME = 'mainServerInstance';
/** Host to bind. */
export const SERVER_HOST_NAME = '0.0.0.0';
/** Port to listen on. */
export const SERVER_PORT = parseNumber({
	name: 'PORT',
	value: process.env.PORT,
	fallback: 5000,
	min: 1,
});

/** OpenAPI documentation settings. */
export const OPEN_API_SETTINGS = {
	path: '/docs',
	documentation: {
		info: {
			title: 'Social Media API',
			description: 'API documentation for HelloPoetry API',
			version: '1.0.0',
		},
	},
};

/** Elysia server configuration settings. */
export const ELYSIA_SERVER_SETTINGS = {
	adapter: BunAdapter,
	name: SERVER_MAIN_INSTANCE_NAME,
	prefix: API_URL_PREFIX,
	sanitize: (value: string) =>
		typeof value === 'string' ? sanitize(value) : value,
	bodyLimit: parseNumber({
		name: 'BODY_LIMIT_BYTES',
		value: process.env.BODY_LIMIT_BYTES,
		fallback: 1_000_000,
		min: 1,
	}),
	serve: {
		hostname: SERVER_HOST_NAME,
		port: SERVER_PORT,
	},
};

const NODE_ENV = process.env.NODE_ENV || 'development';
const SECURITY_HEADERS_ENABLED =
	process.env.SECURITY_HEADERS_ENABLED !== 'false';

/** Whether to apply security headers. */
export function shouldApplySecurityHeaders(): boolean {
	return SECURITY_HEADERS_ENABLED;
}

type LogLevel = 'silent' | 'debug' | 'info';

// Determines the appropriate log level based on the current environment.
export function getLogLevel(): LogLevel {
	if (NODE_ENV === 'test') return 'silent';

	if (NODE_ENV === 'dev' || NODE_ENV === 'development') return 'debug';

	return 'info';
}

/**
 * Database URL from env. It must match the active NODE_ENV so test and
 * development never share the same database by accident.
 */
export function getDatabaseUrl(): string {
	const url = process.env.DATABASE_URL;

	if (!url) throw MissingEnvVarError('DATABASE_URL');
	assertDatabaseSafety({ databaseUrl: url, nodeEnv: NODE_ENV });

	return url;
}

export {
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
	getJwtSecretKey,
	isCsrfEnabled,
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_EXPIRATION_TIME,
	setUpRefreshCookieOptions,
	setUpCookieTokenOptions,
	setUpCsrfCookieOptions,
} from './auth/config';
