import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const UnblockUserSchema = t.Object({
	unblockerId: idSchema,
	unblockedId: idSchema,
});
