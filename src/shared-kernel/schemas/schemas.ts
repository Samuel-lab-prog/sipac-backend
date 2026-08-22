import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const idSchema = t.Numeric({
	minimum: 1,
	example: 1,
	readOnly: true,
	...makeValidationError('ID must be a positive integer'),
});

export const orderDirectionSchema = t.UnionEnum(['asc', 'desc']);

export const dateSchema = t.Date({
	example: new Date().toISOString(),
	readOnly: true,
});

export const nullableDateSchema = t.Nullable(dateSchema);

export const nonNegativeIntegerSchema = t.Numeric({
	minimum: 0,
	...makeValidationError('Value must be a non-negative integer'),
});
export const emailSchema = t.String({
	format: 'email',
	example: 'teste@exemplo.com',
	...makeValidationError('Email must be a valid email address'),
});
