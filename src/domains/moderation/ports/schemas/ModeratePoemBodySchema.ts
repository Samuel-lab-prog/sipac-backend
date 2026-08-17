import { t } from 'elysia';
import { sanctionReasonSchema } from './Fields';

export const ModeratePoemBodySchema = t.Object({
	moderationStatus: t.UnionEnum(['approved', 'rejected', 'removed'] as const),
	reason: t.Optional(sanctionReasonSchema),
});
