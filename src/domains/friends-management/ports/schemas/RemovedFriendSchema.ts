import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const RemovedFriendSchema = t.Object({
	removedById: idSchema,
	removedId: idSchema,
});
