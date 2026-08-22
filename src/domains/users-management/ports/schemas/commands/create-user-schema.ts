import { t } from 'elysia';
import {
	avatarUrlSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userPasswordSchema,
	userRgSchema,
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
});
