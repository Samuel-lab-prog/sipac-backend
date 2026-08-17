import { t } from 'elysia';

import {
	PoemContentSchema,
	PoemTitleSchema,
	PoemExcerptSchema,
	PoemTagsCreationSchema,
	PoemIsCommentableSchema,
	PoemToUserIdsSchema,
	MentionedUserIdsSchema,
} from '../PoemFieldsSchemas';

import { PoemStatusEnumSchema, PoemVisibilityEnumSchema } from '../Enums';

export const UpdatePoemBodySchema = t.Object({
	title: PoemTitleSchema,
	content: PoemContentSchema,
	excerpt: PoemExcerptSchema,
	tags: PoemTagsCreationSchema,

	visibility: PoemVisibilityEnumSchema,
	status: PoemStatusEnumSchema,

	isCommentable: PoemIsCommentableSchema,

	toUserIds: t.Optional(PoemToUserIdsSchema),
	mentionedUserIds: t.Optional(MentionedUserIdsSchema),
});
