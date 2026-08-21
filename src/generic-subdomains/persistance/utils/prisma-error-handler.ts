import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseConflictError,
	DatabaseNotFoundError,
	DatabaseUnknownError,
	DatabaseValidationError,
} from '../../utils/error-handling/database-error/util';
import type { CommandResult } from '@SharedKernel/types/types';

type PrismaMappedError = {
	code: 'CONFLICT' | 'NOT_FOUND' | 'VALIDATION' | 'UNKNOWN';
	message: string;
	error: PrismaClientKnownRequestError;
};

function extractField(error: PrismaClientKnownRequestError) {
	const raw = error.meta?.driverAdapterError;
	if (!raw) return undefined;
	const metaRaw = JSON.stringify(raw);
	return metaRaw.match(/\\"[^_]+_([^\\"]+?)_key\\"/)?.[1];
}

function mapPrismaError(
	error: PrismaClientKnownRequestError,
): PrismaMappedError {
	const modelName = error.meta?.modelName;
	const field = extractField(error);

	switch (error.code) {
		case 'P2002':
			return {
				code: 'CONFLICT',
				message: `Unique ${field} in ${modelName} constraint violated`,
				error,
			};

		case 'P2003':
			return {
				code: 'CONFLICT',
				message: `Foreign key constraint violated on field ${field} in ${modelName}`,
				error,
			};

		case 'P2025':
			return {
				code: 'NOT_FOUND',
				message: `The requested model (${modelName}) was not found`,
				error,
			};
		case 'P2011':
			return {
				code: 'VALIDATION',
				message: `Null constraint violation in ${modelName ?? 'model'}`,
				error,
			};

		default:
			return {
				code: 'UNKNOWN',
				message: `An unknown database error occurred: ${error.message}`,
				error,
			};
	}
}

function handlePrismaError(error: PrismaClientKnownRequestError): never {
	const mapped = mapPrismaError(error);

	switch (mapped.code) {
		case 'CONFLICT':
			throw new DatabaseConflictError(mapped.message);

		case 'NOT_FOUND':
			throw new DatabaseNotFoundError(mapped.message);

		case 'VALIDATION':
			throw new DatabaseValidationError(mapped.message);

		default:
			throw new DatabaseUnknownError(mapped.message);
	}
}

/**
 * Executes a Prisma-backed callback and normalizes any Prisma failure into a
 * domain-specific database error.
 *
 * Use this helper when the caller expects failures to be handled via
 * exceptions instead of returned as data.
 *
 * Prisma error mapping:
 * - `P2002` and `P2003` become `DatabaseConflictError`
 * - `P2025` becomes `DatabaseNotFoundError`
 * - `P2011` becomes `DatabaseValidationError`
 * - any other Prisma error becomes `DatabaseUnknownError`
 * - any non-Prisma error also becomes `DatabaseUnknownError`
 *
 * @typeParam T - The value returned by the callback when it succeeds.
 * @param callback - The Prisma-backed operation to execute.
 * @returns The callback result when successful.
 * @throws {DatabaseConflictError} When Prisma reports a conflict condition.
 * @throws {DatabaseNotFoundError} When Prisma reports a missing record.
 * @throws {DatabaseValidationError} When Prisma reports a validation issue.
 * @throws {DatabaseUnknownError} When Prisma or a non-Prisma error occurs.
 */
export async function withPrismaErrorHandling<T>(
	callback: () => Promise<T>,
): Promise<T> {
	try {
		return await callback();
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError) {
			return handlePrismaError(error);
		}

		throw new DatabaseUnknownError(
			error instanceof Error ? error.message : 'Unknown error',
		);
	}
}

/**
 * Executes a Prisma-backed callback and converts the outcome into a command
 * result object instead of throwing for expected database failures.
 *
 * Use this helper when the caller wants a normalized success/failure payload
 * and prefers to handle the error as data.
 *
 * Prisma error mapping:
 * - `P2002` and `P2003` become `code: 'CONFLICT'`
 * - `P2025` becomes `code: 'NOT_FOUND'`
 * - `P2011` becomes `code: 'VALIDATION'`
 * - any other Prisma error becomes `code: 'UNKNOWN'`
 * - non-Prisma errors become `code: 'UNKNOWN'` with a generic message
 *
 * On success, the result is:
 * `{ ok: true, data }`
 *
 * On failure, the result is:
 * `{ ok: false, data: null, code, error, message }`
 *
 * @typeParam T - The success payload returned by the callback.
 * @param callback - The Prisma-backed operation to execute.
 * @returns A normalized command result describing success or failure.
 */
export async function withPrismaResult<T>(
	callback: () => Promise<T>,
): Promise<CommandResult<T>> {
	try {
		const data = await callback();
		return { ok: true, data };
	} catch (error: unknown) {
		if (error instanceof PrismaClientKnownRequestError) {
			const mapped = mapPrismaError(error);

			return {
				ok: false,
				data: null,
				code: mapped.code,
				error: mapped.error,
				message: mapped.message,
			};
		}

		return {
			ok: false,
			data: null,
			code: 'UNKNOWN',
			error: error instanceof Error ? error : undefined,
			message: 'Unknown error',
		};
	}
}
