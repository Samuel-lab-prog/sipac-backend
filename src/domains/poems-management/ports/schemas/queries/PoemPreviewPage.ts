import { t } from 'elysia';
import { PoemPreviewReadSchema } from './PoemPreviewReadSchema';
import { idSchema } from '@SharedKernel/Schemas';

export const PoemPreviewPageSchema = t.Object({
	poems: t.Array(PoemPreviewReadSchema),
	hasMore: t.Boolean(),
	nextCursor: t.Nullable(idSchema),
});
