import { Elysia } from 'elysia';
// Plugins
import cors from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { ErrorPlugin } from '@GenericSubdomains/utils/error-handling/error-plugin/util';
import { LoggerPlugin } from '@GenericSubdomains/utils/logging/loggerPlugin';
import { RequestCachePlugin } from '@GenericSubdomains/utils/requests-handling/request-caching/requestCachePlugin';
import { CsrfPlugin } from '@GenericSubdomains/utils/security/csrfPlugin';
import { SecurityHeadersPlugin } from '@GenericSubdomains/utils/security/securityHeadersPlugin';
import { SetupPlugin } from '@GenericSubdomains/utils/security/setupPlugin';

// Routers
import {
	userCommandsRouter,
	userCommandsRouterWithFakeHash,
	userQueriesRouter,
} from '@Domains/users-management/Composition';
import {
	authRouter,
	authRouterWithFakeHash,
} from '@GenericSubdomains/authentication/Composition';
import {
	ELYSIA_SERVER_SETTINGS,
	OPEN_API_SETTINGS,
} from 'server-config/config';
import { corsConfig } from 'server-config/cors/config';
import {
	AUTH_RATE_LIMIT_SETTINGS,
	RATE_LIMIT_SETTINGS,
} from 'server-config/rate-limiter/config';
import { createRateLimitPlugin } from 'server-config/rate-limiter/plugin';

type MakeServerOptions = {
	enableRealHash: boolean;
	enableDocs: boolean;
	enableRateLimit: boolean;
	enableLogger: boolean;
};

function safeRateLimit(label: 'auth' | 'global') {
	try {
		return createRateLimitPlugin(
			label === 'auth' ? AUTH_RATE_LIMIT_SETTINGS : RATE_LIMIT_SETTINGS,
		);
	} catch (error) {
		console.warn(
			`[rate-limit] disabled ${label} limiter because the installed plugin is incompatible with this Elysia version.`,
			error instanceof Error ? error.message : error,
		);
		return undefined;
	}
}

function makeServer({
	enableRealHash,
	enableDocs,
	enableRateLimit,
	enableLogger,
}: MakeServerOptions) {
	return (
		new Elysia(ELYSIA_SERVER_SETTINGS)
			.use(enableDocs ? openapi(OPEN_API_SETTINGS) : undefined)
			// Global and auth-specific limits are applied separately.
			.use(enableRateLimit ? safeRateLimit('auth') : undefined)
			.use(enableRateLimit ? safeRateLimit('global') : undefined)
			.use(enableLogger ? LoggerPlugin : undefined)
			.use(cors(corsConfig))
			.use(SetupPlugin)
			.use(RequestCachePlugin)
			.use(SecurityHeadersPlugin)
			.use(CsrfPlugin)
			.use(ErrorPlugin)

			.use(enableRealHash ? userCommandsRouter : userCommandsRouterWithFakeHash)
			.use(enableRealHash ? authRouter : authRouterWithFakeHash)
			.use(userQueriesRouter)
	);
}

export const server = makeServer({
	enableRealHash: true,
	enableDocs: true,
	enableRateLimit: true,
	enableLogger: true,
});

export const testServer = makeServer({
	enableRealHash: false,
	enableDocs: false,
	enableRateLimit: false,
	enableLogger: false,
});
