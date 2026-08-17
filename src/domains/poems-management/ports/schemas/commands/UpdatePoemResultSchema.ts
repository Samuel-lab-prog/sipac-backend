import { t } from 'elysia';
import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemIsCommentableSchema,
	PoemSlugSchema,
	PoemToUserIdsSchema,
	PoemTagsReadSchema,
	MentionedUserIdsSchema,
	PoemAudioUrlSchema,
} from '../PoemFieldsSchemas';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { PoemStatusEnumSchema, PoemVisibilityEnumSchema } from '../Enums';

export const UpdatePoemResultSchema = t.Object({
	id: idSchema,

	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	audioUrl: PoemAudioUrlSchema,
	tags: PoemTagsReadSchema,

	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,

	isCommentable: PoemIsCommentableSchema,

	createdAt: DateSchema,
	updatedAt: DateSchema,

	toUserIds: PoemToUserIdsSchema,
	mentionedUserIds: MentionedUserIdsSchema,
});
