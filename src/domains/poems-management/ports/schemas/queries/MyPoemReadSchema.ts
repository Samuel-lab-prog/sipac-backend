import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemIsCommentableSchema,
	PoemAudioUrlSchema,
} from '../PoemFieldsSchemas';
import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
	UserPreviewSchema,
} from '@SharedKernel/Schemas';

import {
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
} from '../Enums';

export const MyPoemReadSchema = t.Object({
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

	toUsers: t.Array(UserPreviewSchema),

	createdAt: DateSchema,
	updatedAt: DateSchema,

	stats: t.Object({
		likesCount: NonNegativeIntegerSchema,
		commentsCount: NonNegativeIntegerSchema,
	}),
});
