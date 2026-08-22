import { t } from 'elysia';
import {
	avatarUrlSchema,
	academicIdSchema,
	admissionYearSchema,
	campusSchema,
	courseSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userPasswordSchema,
	userRgSchema,
	departmentSchema,
} from '../field-schemas';
import { emailSchema } from '@SharedKernel/schemas/schemas';

export const createUserSchema = t.Object({
	name: userNameSchema,
	nickname: userNicknameSchema,
	email: emailSchema,
	password: userPasswordSchema,
	rg: userRgSchema,
	cpf: userCpfSchema,
	avatarUrl: t.Nullable(avatarUrlSchema),
	academicId: t.Nullable(academicIdSchema),
	campus: t.Nullable(campusSchema),
	department: t.Nullable(departmentSchema),
	course: t.Nullable(courseSchema),
	admissionYear: t.Nullable(admissionYearSchema),
});
