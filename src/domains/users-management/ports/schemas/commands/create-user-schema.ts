import { t } from 'elysia';
import {
	avatarUrlSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userPasswordSchema,
	userRgSchema,
	userRoleSchema,
} from '../field-schemas';
import { emailSchema } from '@SharedKernel/schemas/schemas';

export const createUserSchema = t.Object({
	name: userNameSchema,
	nickname: userNicknameSchema,
	email: emailSchema,
	password: t.Optional(userPasswordSchema),
	rg: userRgSchema,
	cpf: userCpfSchema,
	avatarUrl: t.Nullable(avatarUrlSchema),
	role: t.Optional(userRoleSchema),
});
