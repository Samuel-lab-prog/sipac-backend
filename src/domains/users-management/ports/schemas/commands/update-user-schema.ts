import { t } from 'elysia';
import {
	avatarUrlSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userRgSchema,
	userRoleSchema,
	userStatusSchema,
} from '../field-schemas';
import { emailSchema, idSchema } from '@SharedKernel/schemas/schemas';

export const updateUserParamsSchema = t.Object({
	id: idSchema,
});

export const userIdParamsSchema = t.Object({
	id: idSchema,
});

export const updateUserSchema = t.Object({
	name: t.Optional(userNameSchema),
	nickname: t.Optional(userNicknameSchema),
	email: t.Optional(emailSchema),
	rg: t.Optional(userRgSchema),
	cpf: t.Optional(userCpfSchema),
	role: t.Optional(userRoleSchema),
	status: t.Optional(userStatusSchema),
	avatarUrl: t.Optional(t.Nullable(avatarUrlSchema)),
});
