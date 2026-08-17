import { idSchema, NonNegativeIntegerSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';

export const FeedPoemSchema = t.Object({
	id: idSchema,
	content: t.String(),
	title: t.String(),
	slug: t.String(),
	excerpt: t.Nullable(t.String()),
	tags: t.Array(t.String()),
	createdAt: t.Date(),
	likesCount: NonNegativeIntegerSchema,
	commentsCount: NonNegativeIntegerSchema,
	author: t.Object({
		id: idSchema,
		name: t.String(),
		nickname: t.String(),
		avatarUrl: t.String(),
	}),
});
