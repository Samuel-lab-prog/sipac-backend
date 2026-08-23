import { t } from 'elysia';
import {
	avatarUrlSchema,
	academicIdSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userPasswordSchema,
	userRgSchema,
	userRoleSchema,
	userStatusSchema,
} from '../field-schemas';
import { emailSchema } from '@SharedKernel/schemas/schemas';

export const createUserSchema = t.Object({
	name: userNameSchema,
	nickname: userNicknameSchema,
	email: emailSchema,
	password: userPasswordSchema,
	rg: userRgSchema,
	cpf: userCpfSchema,
	academicId: t.Optional(academicIdSchema),
	avatarUrl: t.Nullable(avatarUrlSchema),
	role: t.Optional(userRoleSchema),
	status: t.Optional(userStatusSchema),
});
