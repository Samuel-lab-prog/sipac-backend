import { t } from 'elysia';
import {
	idSchema,
	DateSchema,
	NonNegativeIntegerSchema,
	UserPreviewSchema,
} from '@SharedKernel/Schemas';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemTagsReadSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemIsCommentableSchema,
	PoemAudioUrlSchema,
} from '../PoemFieldsSchemas';

import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../Enums';

export const AuthorPoemReadSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	audioUrl: PoemAudioUrlSchema,
	tags: PoemTagsReadSchema,

	status: PoemStatusEnumSchema,
	visibility: PoemVisibilityEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,
	rejectionReason: t.Nullable(t.String()),

	isCommentable: PoemIsCommentableSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	toUsers: t.Array(UserPreviewSchema),

	author: UserPreviewSchema,
	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
