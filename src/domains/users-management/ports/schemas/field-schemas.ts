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

export const userBioSchema = t.String({
	minLength: 1,
	examples: ['Software Developer'],
	maxLength: 256,
});

export const userPasswordSchema = t.String({
	minLength: 8,
	example: 'P@ssw0rd',
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
