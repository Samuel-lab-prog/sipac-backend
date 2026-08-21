import { describe, expect, it } from 'bun:test';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
	DatabaseConflictError,
	DatabaseNotFoundError,
	DatabaseUnknownError,
} from '@DatabaseError';
import {
	withPrismaErrorHandling,
	withPrismaResult,
} from './prisma-error-handler';

function makePrismaError(
	code: string,
	message: string,
	meta?: Record<string, unknown>,
) {
	return new PrismaClientKnownRequestError(message, {
		code,
		clientVersion: 'test',
		meta,
	});
}

describe('UNIT - Generic Subdomains Persistance', () => {
	describe('prisma-error-handler', () => {
		it('maps unique constraint errors to conflict errors', async () => {
			const error = makePrismaError('P2002', 'unique failed', {
				modelName: 'User',
				driverAdapterError: { message: '"User_email_key"' },
			});

			await expect(
				withPrismaErrorHandling(async () => {
					throw error;
				}),
			).rejects.toBeInstanceOf(DatabaseConflictError);
		});

		it('maps not found errors to database not found errors', async () => {
			const error = makePrismaError('P2025', 'missing row', {
				modelName: 'User',
			});

			await expect(
				withPrismaErrorHandling(async () => {
					throw error;
				}),
			).rejects.toBeInstanceOf(DatabaseNotFoundError);
		});

		it('wraps unknown errors as database unknown errors', async () => {
			await expect(
				withPrismaErrorHandling(async () => {
					throw new Error('boom');
				}),
			).rejects.toBeInstanceOf(DatabaseUnknownError);
		});

		it('returns mapped prisma errors as failed command results', async () => {
			const error = makePrismaError('P2011', 'null violation', {
				modelName: 'User',
			});

			const result = await withPrismaResult(async () => {
				throw error;
			});

			expect(result).toMatchObject({
				ok: false,
				data: null,
				code: 'VALIDATION',
				message: 'Null constraint violation in User',
			});
		});

		it('returns success command results when callback succeeds', async () => {
			const result = await withPrismaResult(async () => ({ id: 1 }));

			expect(result).toEqual({
				ok: true,
				data: { id: 1 },
			});
		});
	});
});
