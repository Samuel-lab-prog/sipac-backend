import { t } from 'elysia';
import { ERROR_CODES, type ErrorCode } from '../error-codes';

export interface AppErrorType {
	statusCode: number;
	message: string;
	code: ErrorCode;
	originalError?: Error;
}

export const appErrorSchema = t.Object({
	message: t.String(),
	statusCode: t.Number({
		minimum: 400,
		maximum: 599,
	}),
	code: t.UnionEnum(ERROR_CODES),
	originalError: t.Optional(t.Any()),
});

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: ErrorCode;
	public readonly originalError?: Error;

	constructor({ statusCode, message, code, originalError }: AppErrorType) {
		super(message);

		this.name = 'AppError';
		this.statusCode = statusCode;
		this.code = code;
		this.originalError = originalError;

		Error.captureStackTrace?.(this, AppError);
	}
}

export function createAppError(
	statusCode: number,
	prefix: string,
	message: string,
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return new AppError({
		statusCode,
		message: `${prefix}: ${message}`,
		code,
		originalError,
	});
}

export function BadRequestError(
	message: string = 'Bad request',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(400, 'Bad Request', message, code, originalError);
}

export function UnauthorizedError(
	message: string = 'Unauthorized access',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(401, 'Unauthorized', message, code, originalError);
}

export function ForbiddenError(
	message: string = 'Access is forbidden',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(403, 'Forbidden', message, code, originalError);
}

export function NotFoundError(
	message: string = 'The resource was not found',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(404, 'Not found', message, code, originalError);
}

export function ConflictError(
	message: string = 'The resource already exists',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(409, 'Conflict', message, code, originalError);
}

export function GoneError(
	message: string = 'The resource has been deleted',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(410, 'Resource deleted', message, code, originalError);
}

export function UnprocessableEntityError(
	message: string = 'Unprocessable entity',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(
		422,
		'Unprocessable Entity',
		message,
		code,
		originalError,
	);
}

const _ENVOIRMENT_VARIABLE_NAMES = [
	'DATABASE_URL',
	'JWT_SECRET_KEY',
	'CORS_ORIGIN',
	'FRONTEND_URL',
	'S3_BUCKET_NAME',
	'AWS_REGION',
	'AWS_ACCESS_KEY_ID',
	'AWS_SECRET_ACCESS_KEY',
	'S3_PUBLIC_BASE_URL',
	'TRUST_PROXY',
	'TRUSTED_PROXY_IPS',
	'CSRF_ENABLED',
	'AUTH_LOCKOUT_DURATION_MS',
	'AUTH_LOCKOUT_THRESHOLD',
	'AUTH_LOCKOUT_WINDOW_MS',
	'AUTH_RATE_LIMIT_DURATION_MS',
	'AUTH_RATE_LIMIT_MAX',
	'AWS_SESSION_TOKEN',
	'BCRYPT_SALT_ROUNDS',
	'BODY_LIMIT_BYTES',
	'CDN_URL_ALLOWLIST',
	'COOKIE_DOMAIN',
	'CROSS_SITE_COOKIES',
	'CSRF_ORIGIN_ALLOWLIST',
	'CSRF_SKIP_PATHS',
	'JWT_AUDIENCE',
	'JWT_ISSUER',
	'JWT_REQUIRE_CLAIMS',
	'MAX_AVATAR_UPLOAD_BYTES',
	'MAX_POEM_AUDIO_UPLOAD_BYTES',
	'NODE_ENV',
	'PORT',
	'RATE_LIMIT_CONTEXT_SIZE',
	'RATE_LIMIT_ERROR_JSON',
	'RATE_LIMIT_HEADERS',
	'RATE_LIMIT_SKIP_PATHS',
	'S3_SIGNED_URL_EXPIRES_IN',
	'SECURITY_HEADERS_ENABLED',
] as const;

export function MissingEnvVarError(
	varName: (typeof _ENVOIRMENT_VARIABLE_NAMES)[number],
): AppError {
	return createAppError(
		500,
		'Configuration error',
		`Missing environment variable: ${varName}`,
		'INTERNAL_SERVER_ERROR',
	);
}

export function DatabaseError(
	message: string = 'A database error occurred',
	code: ErrorCode,
	originalError?: Error,
): AppError {
	return createAppError(500, 'Database error', message, code, originalError);
}

export function ServerError(
	message: string = 'An unexpected error occurred',
	code: ErrorCode = 'INTERNAL_SERVER_ERROR',
	originalError?: Error,
): AppError {
	return createAppError(500, 'Server error', message, code, originalError);
}

export function makeValidationError(message: string) {
	return {
		error() {
			throw UnprocessableEntityError(message, 'VALIDATION');
		},
	};
}
export function makeBadRequestError(message: string) {
	return {
		error() {
			throw BadRequestError(message, 'BAD_REQUEST');
		},
	};
}
export function makeUnauthorizedError(message: string) {
	return {
		error() {
			throw UnauthorizedError(message, 'UNAUTHORIZED');
		},
	};
}
