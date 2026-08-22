import { t } from 'elysia';
import { userPasswordSchema } from '../field-schemas';

export const changePasswordSchema = t.Object({
	currentPassword: userPasswordSchema,
	newPassword: userPasswordSchema,
});
