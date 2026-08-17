import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const paginationLimitSchema = t.Optional(
	t.Numeric({
		minimum: 1,
		maximum: 200,
		...makeValidationError(
			'Limit must be a positive integer between 1 and 200',
		),
	}),
);
