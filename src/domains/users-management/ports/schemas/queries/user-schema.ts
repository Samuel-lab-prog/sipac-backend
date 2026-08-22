import { t } from 'elysia';
import {
	dateSchema,
	emailSchema,
	idSchema,
} from '@SharedKernel/schemas/schemas';
import {
	avatarUrlSchema,
	userCpfSchema,
	userNameSchema,
	userNicknameSchema,
	userRgSchema,
	userRoleSchema,
	userStatusSchema,
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
	createdAt: dateSchema,
	updatedAt: dateSchema,
	deletedAt: t.Nullable(dateSchema),
	emailVerifiedAt: t.Nullable(dateSchema),
});
