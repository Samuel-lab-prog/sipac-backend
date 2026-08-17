import { t } from 'elysia';
import {
	DateSchema,
	idSchema,
	NonNegativeIntegerSchema,
	UserPreviewSchema,
} from '@SharedKernel/Schemas';
import {
	PoemSlugSchema,
	PoemExcerptSchema,
	PoemTagsReadSchema,
	PoemTitleSchema,
} from '../PoemFieldsSchemas';
import { PoemStatusEnumSchema } from '../Enums';

export const PoemPreviewReadSchema = t.Object({
	id: idSchema,
	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	excerpt: PoemExcerptSchema,
	createdAt: DateSchema,
	status: PoemStatusEnumSchema,
	likesCount: t.Optional(NonNegativeIntegerSchema),
	commentsCount: t.Optional(NonNegativeIntegerSchema),
	tags: PoemTagsReadSchema,
	author: UserPreviewSchema,
});
