import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const userNicknameSchema = t.String({
	minLength: 3,
	example: 'poetrylover',
	pattern: '^[a-zA-Z0-9_.]+$',
	...makeValidationError(
		'Nickname must be at least 3 characters long and contain only letters, numbers, underscores, and dots',
	),
});

export const userNameSchema = t.String({
	minLength: 3,
	example: 'Ana Clara',
	pattern: '^(?!\\s*$).+',
	...makeValidationError(
		'Name must be at least 3 characters long and contain non-whitespace characters',
	),
});

export const userRoleSchema = t.Union([
	t.Literal('student'),
	t.Literal('professor'),
	t.Literal('staff'),
	t.Literal('admin'),
]);

export const userStatusSchema = t.Union([
	t.Literal('active'),
	t.Literal('blocked'),
	t.Literal('suspended'),
]);

export const userRgSchema = t.String({
	minLength: 5,
	maxLength: 20,
	example: '12.345.678-9',
	...makeValidationError('RG must be a valid identifier'),
});

export const userCpfSchema = t.String({
	minLength: 11,
	maxLength: 14,
	example: '123.456.789-00',
	...makeValidationError('CPF must be a valid identifier'),
});

export const userPasswordSchema = t.String({
	minLength: 8,
	example: '12341234',
	maxLength: 64,
	...makeValidationError(
		'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
	),
});

export const avatarUrlSchema = t.String({
	format: 'uri',
	example: 'https://cdn.example.com/avatar.png',
	...makeValidationError('Avatar URL must be a valid http(s) URL'),
});

export const academicIdSchema = t.String({
	minLength: 3,
	example: '2026000123',
	...makeValidationError('Academic ID must be at least 3 characters long'),
});

export const campusSchema = t.String({
	minLength: 2,
	example: 'Campus Central',
	...makeValidationError('Campus must be at least 2 characters long'),
});

export const departmentSchema = t.String({
	minLength: 2,
	example: 'Computer Science Department',
	...makeValidationError('Department must be at least 2 characters long'),
});

export const courseSchema = t.String({
	minLength: 2,
	example: 'Computer Science',
	...makeValidationError('Course must be at least 2 characters long'),
});

export const admissionYearSchema = t.Number({
	minimum: 1900,
	maximum: 2100,
	example: 2026,
	...makeValidationError('Admission year must be a valid year'),
});
