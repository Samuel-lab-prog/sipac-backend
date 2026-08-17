import { t } from 'elysia';
import {
	idSchema,
	userRoleSchema,
	userStatusSchema,
} from '@SharedKernel/Schemas';

export const authClientSchema = t.Object({
	id: idSchema,
	role: userRoleSchema,
	status: userStatusSchema,
});
