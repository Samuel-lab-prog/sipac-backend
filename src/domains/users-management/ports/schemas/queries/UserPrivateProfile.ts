import { t } from 'elysia';
import { UserRoleEnumSchema, UserStatusEnumSchema } from '../Enums';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	EmailSchema,
	NameSchema,
	NicknameSchema,
} from '../UserFieldsSchemas';

export const UserPrivateProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: t.Nullable(AvatarUrlSchema),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	email: EmailSchema,
	emailVerifiedAt: t.Nullable(DateSchema),
	unreadNotificationsCount: t.Number(),
	poems: t.Array(
		t.Object({
			id: idSchema,
			title: t.String(),
			slug: t.String(),
			createdAt: DateSchema,
			likesCount: t.Number(),
			commentsCount: t.Number(),
			tags: t.Array(
				t.Object({
					id: idSchema,
					name: t.String(),
				}),
			),
			author: t.Object({
				id: idSchema,
				name: NameSchema,
				nickname: NicknameSchema,
				avatarUrl: t.Nullable(AvatarUrlSchema),
			}),
		}),
	),

	stats: t.Object({
		poems: t.Array(
			t.Object({
				id: idSchema,
				title: t.String(),
			}),
		),
		commentsIds: t.Array(idSchema),
		friends: t.Array(
			t.Object({
				id: idSchema,
			}),
		),
	}),
	blockedUsersIds: t.Array(idSchema),
});
