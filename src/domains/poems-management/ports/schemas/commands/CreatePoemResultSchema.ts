import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemToUserIdsSchema,
	PoemExcerptSchema,
	PoemIsCommentableSchema,
	PoemSlugSchema,
	PoemTagsReadSchema,
	PoemTitleSchema,
	MentionedUserIdsSchema,
	PoemAudioUrlSchema,
} from '../PoemFieldsSchemas';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

import {
	PoemModerationStatusEnumSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
} from '../Enums';

export const CreatePoemResultSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	excerpt: t.Nullable(PoemExcerptSchema),
	tags: PoemTagsReadSchema,
	content: PoemContentSchema,
	audioUrl: PoemAudioUrlSchema,

	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,
	moderationStatus: PoemModerationStatusEnumSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	isCommentable: PoemIsCommentableSchema,

	toUserIds: PoemToUserIdsSchema,
	mentionedUserIds: MentionedUserIdsSchema,
});
