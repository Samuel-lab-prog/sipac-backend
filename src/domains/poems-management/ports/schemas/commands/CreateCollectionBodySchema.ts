import { makeValidationError } from '@AppError';
import { idSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';

export const CreateCollectionSchema = t.Object({
	userId: idSchema,
	name: t.String({
		minLength: 3,
		maxLength: 60,
		pattern: '^(?!\\s*$).+',
		...makeValidationError(
			'Collection name must be between 3 and 60 characters and contain non-whitespace characters',
		),
	}),
	description: t.Optional(
		t.String({
			maxLength: 200,
			...makeValidationError(
				'Collection description must be at most 200 characters',
			),
		}),
	),
});
