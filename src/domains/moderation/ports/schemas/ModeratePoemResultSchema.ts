import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

const PoemModerationStatusSchema = t.UnionEnum([
	'pending',
	'approved',
	'rejected',
	'removed',
] as const);

export const ModeratePoemResultSchema = t.Object({
	id: idSchema,
	moderationStatus: PoemModerationStatusSchema,
});
