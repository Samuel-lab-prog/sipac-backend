import { makeValidationError } from '@AppError';
import { t } from 'elysia';
export const cpfSchema = t.String({
	minLength: 11,
	maxLength: 14,
	example: '123.456.789-00',
	...makeValidationError('CPF must be a valid identifier'),
});
export const passwordSchema = t.String({
	minLength: 8,
	maxLength: 30,
	example: '12341234',
	...makeValidationError('Password must be between 8 and 30 characters'),
});
export const loginSchema = t.Object({
	cpf: cpfSchema,
	password: passwordSchema,
});
