import { makeValidationError } from '@AppError';
import { AudioUrlSchema, idSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';

export const PoemTitleSchema = t.String({
	minLength: 3,
	maxLength: 120,
	example: 'Noite sobre o cais',
	pattern: '^(?!\\s*$).+',
	...makeValidationError(
		'Title must be between 3 and 120 characters and contain non-whitespace characters',
	),
});

export const PoemContentSchema = t.String({
	minLength: 1,
	maxLength: 10_000,
	example: `O mar respira lento
sob a lua cansada`,
	pattern: '^(?!\\s*$)[\\s\\S]+$',
	...makeValidationError(
		'Poem content cannot be empty or contain only whitespace',
	),
});

export const PoemExcerptSchema = t.Nullable(
	t.String({
		maxLength: 255,
		example: 'O mar respira lento sob a lua cansada...',
		...makeValidationError('Excerpt must be at most 255 characters long'),
	}),
);

export const PoemAudioUrlSchema = t.Nullable(AudioUrlSchema);

export const PoemSlugSchema = t.String({
	pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
	example: 'noite-sobre-o-cais',
	readOnly: true,
	...makeValidationError(
		'Slug must contain only lowercase letters, numbers, and hyphens',
	),
});

export const TagNameSchema = t.String({
	minLength: 2,
	maxLength: 24,
	example: 'melancolia',
	...makeValidationError(
		'Tag name must be between 2 and 24 characters and contain only letters, numbers, hyphens or underscores',
	),
});

export const PoemTagsCreationSchema = t.Array(TagNameSchema, {
	maxItems: 5,
	uniqueItems: true,
	...makeValidationError('A poem can have up to 5 unique tags'),
});

export const PoemTagsReadSchema = t.Array(
	t.Object({
		id: idSchema,
		name: TagNameSchema,
	}),
	{ uniqueItems: true },
);

export const PoemIsCommentableSchema = t.Boolean({
	example: true,
	...makeValidationError('IsCommentable must be a boolean value'),
});

export const PoemToUserIdsSchema = t.Array(idSchema, {
	maxItems: 5,
	uniqueItems: true,
	...makeValidationError(
		'DedicationUserIds must contain at least 1 unique user ID and at most 5',
	),
});

export const MentionedUserIdsSchema = t.Array(idSchema, {
	maxItems: 10,
	uniqueItems: true,
	...makeValidationError(
		'MentionedUserIds must contain at least 1 unique user ID and at most 10',
	),
});
