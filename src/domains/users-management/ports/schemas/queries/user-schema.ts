import { t } from 'elysia';
import {
	dateSchema,
	emailSchema,
	idSchema,
} from '@SharedKernel/schemas/schemas';
import { userNameSchema } from '../field-schemas';

export const userSchema = t.Object({
	id: idSchema,
	name: userNameSchema,
	email: emailSchema,
	createdAt: dateSchema,
	updatedAt: dateSchema,
});
