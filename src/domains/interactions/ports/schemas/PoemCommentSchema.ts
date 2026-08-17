import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
	userStatusSchema,
} from '@SharedKernel/Schemas';
import { t } from 'elysia';
import { CommentContentSchema, CommentStatusSchema } from './Fields';

export const PoemCommentSchema = t.Object({
	id: idSchema,
	poemId: idSchema,
	content: CommentContentSchema,
	createdAt: DateSchema,
	status: CommentStatusSchema,
	parentId: t.Nullable(idSchema),
	aggregateChildrenCount: NonNegativeIntegerSchema,
	likesCount: NonNegativeIntegerSchema,
	likedByCurrentUser: t.Boolean(),
	author: t.Object({
		id: idSchema,
		nickname: t.String(),
		avatarUrl: t.Nullable(t.String()),
		status: t.Optional(userStatusSchema),
		isUnavailable: t.Optional(t.Boolean()),
	}),
});
