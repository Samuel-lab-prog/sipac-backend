import { t } from 'elysia';
import { userSchema } from './user-schema';
import { academicIdSchema } from '../field-schemas';

export const createdUserSchema = t.Intersect([
	userSchema,
	t.Object({
		academicId: t.Optional(academicIdSchema),
	}),
]);
