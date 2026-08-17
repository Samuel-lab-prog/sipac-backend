import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const sanctionReasonSchema = t.String({
	minLength: 10,
	maxLength: 500,
	...makeValidationError('Reason must be between 10 and 500 characters long'),
});

export const suspensionDurationDaysSchema = t.Number({
	minimum: 1,
	maximum: 365,
	...makeValidationError('Duration must be between 1 and 365 days'),
});
