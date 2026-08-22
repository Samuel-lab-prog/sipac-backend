import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';
import {
	campusSchema,
	courseSchema,
	departmentSchema,
	userRoleSchema,
	userStatusSchema,
} from '../field-schemas';

export const searchUsersQuerySchema = t.Object({
	searchTerm: t.Optional(t.String()),
	role: t.Optional(userRoleSchema),
	status: t.Optional(userStatusSchema),
	deleted: t.Optional(t.Boolean()),
	campus: t.Optional(campusSchema),
	department: t.Optional(departmentSchema),
	course: t.Optional(courseSchema),
	limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
	cursor: t.Optional(idSchema),
});
