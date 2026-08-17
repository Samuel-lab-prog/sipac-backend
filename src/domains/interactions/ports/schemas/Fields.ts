import { makeValidationError } from '@AppError';
import { t } from 'elysia';

export const CommentContentSchema = t.String({
	minLength: 1,
	maxLength: 3000,
	examples: ['Awesome poem! Loved every bit of it.'],
	...makeValidationError(
		'Comment content must be between 1 and 3000 characters long.',
	),
});

export const CommentStatusSchema = t.UnionEnum([
	'visible',
	'deletedByAuthor',
	'deletedByModerator',
]);
