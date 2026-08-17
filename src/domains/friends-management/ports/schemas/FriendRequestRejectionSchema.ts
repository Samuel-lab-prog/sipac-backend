import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const FriendRequestRejectionSchema = t.Object({
	rejectedId: idSchema,
	rejecterId: idSchema,
});
