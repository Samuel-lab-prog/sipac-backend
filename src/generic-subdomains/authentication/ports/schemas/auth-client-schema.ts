import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';
import { userRoleSchema, userStatusSchema } from '@Domains/users-management/public/index';

export const authClientSchema = t.Object({
	id: idSchema,
	role: userRoleSchema,
	status: userStatusSchema,
});
