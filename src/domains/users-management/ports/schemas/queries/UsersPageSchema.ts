import { t } from 'elysia';

import { UserPreviewSchema } from './UserPreview';
import { idSchema } from '@SharedKernel/Schemas';

export const UsersPageSchema = t.Object({
	users: t.Array(UserPreviewSchema),
	nextCursor: t.Optional(idSchema),
	hasMore: t.Boolean(),
});
