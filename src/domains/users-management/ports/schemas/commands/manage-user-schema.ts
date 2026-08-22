import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';
import { userRoleSchema, userStatusSchema } from '../field-schemas';

export const manageUserParamsSchema = t.Object({
	id: idSchema,
});

export const changeUserStatusSchema = t.Object({
	status: userStatusSchema,
});

export const changeUserRoleSchema = t.Object({
	role: userRoleSchema,
});
