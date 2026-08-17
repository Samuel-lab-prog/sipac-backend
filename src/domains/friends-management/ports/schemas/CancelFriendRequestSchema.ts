import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const CancelFriendRequestSchema = t.Object({
	cancellerId: idSchema,
	cancelledId: idSchema,
});
