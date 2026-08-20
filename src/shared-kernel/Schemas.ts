import { makeValidationError } from '@AppError';
import { t } from 'elysia';

const NODE_ENV = process.env.NODE_ENV || 'development';
const URL_SCHEME_PATTERN =
	NODE_ENV === 'production' ? '^https://' : '^https?://';

export const idSchema = t.Numeric({
	minimum: 1,
	example: 1,
	readOnly: true,
	...makeValidationError('ID must be a positive integer'),
});

export const orderDirectionSchema = t.UnionEnum(['asc', 'desc']);

export const paginationLimitSchema = t.Numeric({
	minimum: 1,
	maximum: 200,
	...makeValidationError('Limit must be a positive integer between 1 and 200'),
});

export const DateSchema = t.Date({
	example: new Date().toISOString(),
	readOnly: true,
});

export const NullableDateSchema = t.Nullable(DateSchema);

export const NonNegativeIntegerSchema = t.Numeric({
	minimum: 0,
	...makeValidationError('Value must be a non-negative integer'),
});

export const NicknameSchema = t.String({
	minLength: 3,
	example: 'poetrylover',
	pattern: '^[a-zA-Z0-9_.]+$',
	...makeValidationError(
		'Nickname must be at least 3 characters long and contain only letters, numbers, underscores, and dots',
	),
});

export const NameSchema = t.String({
	minLength: 3,
	example: 'Ana Clara',
	pattern: '^(?!\\s*$).+',
	...makeValidationError(
		'Name must be at least 3 characters long and contain non-whitespace characters',
	),
});

export const AvatarUrlSchema = t.String({
	format: 'uri',
	pattern: URL_SCHEME_PATTERN,
	example: 'https://cdn.example.com/avatar.png',
	...makeValidationError('Avatar URL must be a valid http(s) URL'),
});

export const AudioUrlSchema = t.String({
	format: 'uri',
	pattern: URL_SCHEME_PATTERN,
	example: 'https://cdn.example.com/poems/1/audio/recording.mp3',
	...makeValidationError('Audio URL must be a valid http(s) URL'),
});

