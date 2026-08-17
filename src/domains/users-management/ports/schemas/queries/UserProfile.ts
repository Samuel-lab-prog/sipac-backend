import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import {
	AvatarUrlSchema,
	BioSchema,
	EmailSchema,
	NameSchema,
	NicknameSchema,
} from '../UserFieldsSchemas';
import { UserRoleEnumSchema, UserStatusEnumSchema } from '../Enums';

const ProfilePoemSchema = t.Object({
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
});

const ProfileStatsSchema = t.Object({
	poemsCount: t.Optional(t.Number()),
	commentsCount: t.Optional(t.Number()),
	friendsCount: t.Optional(t.Number()),
	poems: t.Optional(
		t.Array(
			t.Object({
				id: idSchema,
				title: t.String(),
			}),
		),
	),
	commentsIds: t.Optional(t.Array(idSchema)),
	friends: t.Optional(
		t.Array(
			t.Object({
				id: idSchema,
			}),
		),
	),
});

/**
 * Shared response schema for public and private user profile payloads.
 * The route returns one of two shapes, but both share this superset safely.
 */
export const UserProfileSchema = t.Object({
	id: idSchema,
	nickname: NicknameSchema,
	name: NameSchema,
	bio: BioSchema,
	avatarUrl: t.Nullable(AvatarUrlSchema),
	role: UserRoleEnumSchema,
	status: UserStatusEnumSchema,
	poems: t.Array(ProfilePoemSchema),
	stats: ProfileStatsSchema,
	email: t.Optional(EmailSchema),
	emailVerifiedAt: t.Optional(t.Nullable(DateSchema)),
	unreadNotificationsCount: t.Optional(t.Number()),
	blockedUsersIds: t.Optional(t.Array(idSchema)),
	isFriend: t.Optional(t.Boolean()),
	hasBlockedRequester: t.Optional(t.Boolean()),
	isBlockedByRequester: t.Optional(t.Boolean()),
	isFriendRequester: t.Optional(t.Boolean()),
	hasIncomingFriendRequest: t.Optional(t.Boolean()),
});
