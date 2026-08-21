/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseError } from '../database-error/util.ts';
import Elysia from 'elysia';
import { log } from '../../logging/logger.ts';
import {
	SetupPlugin,
	type SetupPluginContext,
} from '../../security/setupPlugin.ts';
import { DomainError } from '../domain-error/util.ts';
import { AppError } from '../app-error/util.ts';
import type { ErrorCode } from '../errorCodes.ts';

function normalizeError(code: unknown, error: unknown): AppError {
	if (error instanceof AppError) return error;

	if (error instanceof DomainError) return convertDomainError(error, error);

	if (error instanceof DatabaseError) return convertDatabaseError(error);

	const normalizedCode = typeof code === 'string' ? code : 'UNKNOWN';

	return convertElysiaError(
		normalizedCode,
		error instanceof Error ? error : undefined,
	);
}

function convertDatabaseError(error: DatabaseError): AppError {
	switch (error.type) {
		case 'NOT_FOUND':
			return new AppError({
				statusCode: 404,
				message: error.message,
				code: 'NOT_FOUND',
				originalError: error,
			});

		case 'CONFLICT':
			return new AppError({
				statusCode: 409,
				message: error.message,
				code: 'CONFLICT',
				originalError: error,
			});
		case 'VALIDATION':
			return new AppError({
				statusCode: 422,
				message: error.message,
				code: 'VALIDATION',
				originalError: error,
			});

		case 'FORBIDDEN':
			return new AppError({
				statusCode: 403,
				message: error.message,
				code: 'FORBIDDEN',
				originalError: error,
			});

		default:
			return new AppError({
				statusCode: 500,
				message: error.message,
				code: 'INTERNAL_SERVER_ERROR',
				originalError: error,
			});
	}
}

function convertElysiaError(code: string, originalError?: Error): AppError {
	switch (code) {
		case 'NOT_FOUND':
			return new AppError({
				statusCode: 404,
				message: 'Not Found: resource not found',
				code: 'NOT_FOUND',
				originalError,
			});

		case 'PARSE':
			return new AppError({
				statusCode: 400,
				message: 'Bad request: Failed to parse request body.',
				code: 'BAD_REQUEST',
				originalError,
			});

		case 'VALIDATION':
			return new AppError({
				statusCode: 422,
				message: 'Validation failed',
				code: 'VALIDATION',
				originalError,
			});

		case 'INVALID_COOKIE_SIGNATURE':
			return new AppError({
				statusCode: 401,
				message: 'Invalid cookie signature',
				code: 'UNAUTHORIZED',
				originalError,
			});

		default:
			return new AppError({
				statusCode: 500,
				message: 'Internal server error',
				code: 'INTERNAL_SERVER_ERROR',
				originalError,
			});
	}
}

function convertDomainError(
	error: DomainError,
	originalError?: Error,
): AppError {
	return new AppError({
		message: error.message,
		statusCode: domainStatusMap[error.type] ?? 400,
		code: error.type as ErrorCode,
		originalError: originalError ?? error,
	});
}

const domainStatusMap: Record<ErrorCode, number> = {
	UNPROCESSABLE_ENTITY: 422,
	NOT_FOUND: 404,
	CONFLICT: 409,
	UNAUTHORIZED: 401,
	VALIDATION: 400,
	FORBIDDEN: 403,
	BAD_REQUEST: 400,
	GONE: 410,
	INTERNAL_SERVER_ERROR: 500,
	UNKNOWN: 500,
	RATE_LIMIT_EXCEEDED: 500,
};

function logError(
	context: ReturnType<typeof buildErrorContext>,
	status: number,
	message: string,
	code: ErrorCode,
	originalError?: Error,
) {
	log.error(
		{
			...context,
			response: {
				status,
				message,
				code,
			},
			originalError: originalError
				? {
						name: originalError.name,
						message: originalError.message,
						stack: originalError.stack,
					}
				: undefined,
		},
		'An error occurred while processing the request',
	);
}

function buildErrorContext(request: Request, ctx: SetupPluginContext) {
	const url = new URL(request.url);
	const path = url.pathname;

	const segments = path.split('/').filter(Boolean);

	/**
	 * Example:
	 * /api/v1/friends/accept/263
	 * segments => ['api','v1','friends','accept','263']
	 */
	const targetId = extractNumericSegment(segments);

	return {
		request: {
			reqId: ctx.store.reqId,
			method: request.method,
			path,
			segments,
			targetId,
		},
		auth: {
			isAuthenticated: ctx.auth.clientId > 0,
			userId: ctx.auth.clientId > 0 ? ctx.auth.clientId : 'guest',
			role: ctx.auth.clientId > 0 ? ctx.auth.clientRole : 'guest',
		},
		timings: {
			totalMs: performance.now() - ctx.store.reqInitiatedAt,
			authMs: ctx.store.authTiming,
		},
	};
}

function extractNumericSegment(segments: string[]): number | undefined {
	const candidate = segments.at(-1);
	if (!candidate) return undefined;

	const parsed = Number(candidate);
	return Number.isInteger(parsed) ? parsed : undefined;
}

type HandleErrorContext = {
	set: any;
	error: unknown;
	code: unknown;
	request: Request;
	store: SetupPluginContext['store'];
	auth: SetupPluginContext['auth'];
};

function handleError(ctx: HandleErrorContext) {
	const { set, error, code, request, store, auth } = ctx;

	const appError = normalizeError(code, error);
	const context = buildErrorContext(request, { store, auth });

	set.status = appError.statusCode;

	const original =
		error instanceof Error
			? error
			: appError.originalError instanceof Error
				? appError.originalError
				: undefined;
	logError(
		context,
		appError.statusCode,
		appError.message,
		appError.code,
		original,
	);

	return sendAppError(appError);
}

function sendAppError(err: AppError) {
	return {
		message: err.message,
		statusCode: err.statusCode,
		code: err.code,
	};
}

export const ErrorPlugin = new Elysia()
	.use(SetupPlugin)
	.onError({ as: 'global' }, (ctx) => handleError(ctx));
