import { Elysia } from 'elysia';
// Plugins
import cors from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { ErrorPlugin } from './generic-subdomains/utils/error-handling/error-plugin/util';
import { LoggerPlugin } from './generic-subdomains/utils/logging/logger-plugin';
import { RequestCachePlugin } from './generic-subdomains/utils/requests-handling/request-caching/request-cache-plugin';
import { CsrfPlugin } from './generic-subdomains/utils/security/csrf-plugin';
import { SecurityHeadersPlugin } from './generic-subdomains/utils/security/security-headers-plugin';
import { SetupPlugin } from './generic-subdomains/utils/security/setup-plugin';

// Routers
import {
	userCommandsRouter,
	userCommandsRouterWithFakeHash,
	userQueriesRouter,
} from '@Domains/users-management/composition';
import {
	academicCommandsRouter,
	academicQueriesRouter,
} from '@Domains/academic-management/composition';
import {
	communicationsCommandsRouter,
	communicationsQueriesRouter,
} from '@Domains/communications-management/composition';
import {
	attendanceCommandsRouter,
	attendanceDeleteCommandsRouter,
	attendanceQueriesRouter,
} from '@Domains/attendance-management/composition';
import {
	activitiesCommandsRouter,
	activitiesQueriesRouter,
} from '@Domains/activities-management/composition';
import {
	scheduleCommandsRouter,
	scheduleDeleteCommandsRouter,
	scheduleQueriesRouter,
} from '@Domains/schedule-management/composition';
import {
	curriculumCommandsRouter,
	curriculumQueriesRouter,
} from '@Domains/curriculum-management/composition';
import { academicCalendarQueriesRouter } from '@Domains/academic-calendar-management/composition';
import {
	authRouter,
	authRouterWithFakeHash,
} from '@GenericSubdomains/authentication/composition';
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
import { localStorageRouter } from '@SharedKernel/infra/storage/local-storage-router';

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
			.use(
				process.env.STORAGE_DRIVER === 'local' ? localStorageRouter : undefined,
			)

			.use(enableRealHash ? userCommandsRouter : userCommandsRouterWithFakeHash)
			.use(academicCommandsRouter)
			.use(activitiesCommandsRouter)
			.use(attendanceCommandsRouter)
			.use(attendanceDeleteCommandsRouter)
			.use(scheduleCommandsRouter)
			.use(scheduleDeleteCommandsRouter)
			.use(curriculumCommandsRouter)
			.use(communicationsCommandsRouter)
			.use(enableRealHash ? authRouter : authRouterWithFakeHash)
			.use(userQueriesRouter)
			.use(academicQueriesRouter)
			.use(communicationsQueriesRouter)
			.use(activitiesQueriesRouter)
			.use(attendanceQueriesRouter)
			.use(scheduleQueriesRouter)
			.use(curriculumQueriesRouter)
			.use(academicCalendarQueriesRouter)
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
