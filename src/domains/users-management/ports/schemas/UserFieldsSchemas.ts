import { makeValidationError } from '@AppError';
import { AvatarUrlSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';

export {
	AvatarUrlSchema, NameSchema,
	NicknameSchema
} from '@SharedKernel/Schemas';

export const NullableAvatarUrlSchema = t.Nullable(AvatarUrlSchema);

export const EmailSchema = t.String({
	format: 'email',
	example: 'ana@gmail.com',
	...makeValidationError('Invalid email address'),
});

export const PasswordSchema = t.String({
	minLength: 8,
	maxLength: 40,
	example: 'ana12345',
	...makeValidationError(
		'Password must be at least 8 characters long and at most 40 characters long',
	),
});

export const BioSchema = t.String({
	maxLength: 255,
	example: 'Average poetry lover.',
	...makeValidationError('Bio must be at most 255 characters long'),
});
