import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';
import { PoemCommentSchema } from './PoemCommentSchema';

export const PoemCommentsPageSchema = t.Object({
	comments: t.Array(PoemCommentSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Optional(idSchema),
});
