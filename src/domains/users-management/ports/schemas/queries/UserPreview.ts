import { t } from 'elysia';
import { UserRoleEnumSchema } from '../Enums';
import {
	AvatarUrlSchema,
	NameSchema,
	NicknameSchema,
} from '../UserFieldsSchemas';
import { idSchema } from '@SharedKernel/Schemas';

export const UserPreviewSchema = t.Object({
	avatarUrl: t.Nullable(AvatarUrlSchema),
	id: idSchema,
	name: NameSchema,
	nickname: NicknameSchema,
	role: UserRoleEnumSchema,
});
