import { t } from 'elysia';
import {
	avatarUrlSchema,
	userBioSchema,
	userNameSchema,
	userNicknameSchema,
	userPasswordSchema,
} from '../field-schemas';
import { emailSchema } from '@SharedKernel/schemas/schemas';

export const createUserSchema = t.Object({
	name: userNameSchema,
	nickname: userNicknameSchema,
	email: emailSchema,
	password: userPasswordSchema,
	bio: userBioSchema,
	avatarUrl: t.Nullable(avatarUrlSchema),
});
