import { t } from 'elysia';
import {
	dateSchema,
	emailSchema,
	idSchema,
} from '@SharedKernel/schemas/schemas';
import {
	academicIdSchema,
	admissionYearSchema,
	avatarUrlSchema,
	campusSchema,
	courseSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userRgSchema,
	userRoleSchema,
	userStatusSchema,
	departmentSchema,
} from '../field-schemas';

export const userSchema = t.Object({
	id: idSchema,
	name: userNameSchema,
	nickname: userNicknameSchema,
	email: emailSchema,
	rg: userRgSchema,
	cpf: userCpfSchema,
	role: userRoleSchema,
	status: userStatusSchema,
	avatarUrl: t.Nullable(avatarUrlSchema),
	academicId: t.Nullable(academicIdSchema),
	campus: t.Nullable(campusSchema),
	department: t.Nullable(departmentSchema),
	course: t.Nullable(courseSchema),
	admissionYear: t.Nullable(admissionYearSchema),
	createdAt: dateSchema,
	updatedAt: dateSchema,
	deletedAt: t.Nullable(dateSchema),
	emailVerifiedAt: t.Nullable(dateSchema),
});
