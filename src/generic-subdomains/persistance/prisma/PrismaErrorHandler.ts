import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseConflictError,
	DatabaseNotFoundError,
	DatabaseUnknownError,
	DatabaseValidationError,
} from '@DatabaseError';
import type { CommandResult } from '@SharedKernel/Types';

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
