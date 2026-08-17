import { t } from 'elysia';

import { UserRoleEnumSchema, UserStatusEnumSchema } from '../Enums';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	NameSchema,
	NicknameSchema,
} from '../UserFieldsSchemas';

export const UserPublicProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: t.Nullable(AvatarUrlSchema),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
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
		poemsCount: t.Number(),
		commentsCount: t.Number(),
		friendsCount: t.Number(),
	}),

	isFriend: t.Boolean(),
	hasBlockedRequester: t.Boolean(),
	isBlockedByRequester: t.Boolean(),
	isFriendRequester: t.Boolean(),
	hasIncomingFriendRequest: t.Boolean(),
});
