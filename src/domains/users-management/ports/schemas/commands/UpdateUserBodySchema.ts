import { t } from 'elysia';
import {
	NicknameSchema,
	NameSchema,
	BioSchema,
	NullableAvatarUrlSchema,
} from '../UserFieldsSchemas';

export const UpdateUserBodySchema = t.Partial(
	t.Object({
		name: NameSchema,
		nickname: NicknameSchema,
		bio: BioSchema,
		avatarUrl: NullableAvatarUrlSchema,
	}),
);
