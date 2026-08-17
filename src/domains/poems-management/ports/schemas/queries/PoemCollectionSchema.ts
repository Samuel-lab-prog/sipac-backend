import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';

export const PoemCollectionSchema = t.Object({
	id: idSchema,
	poemIds: t.Array(idSchema),
	name: t.String(),
	description: t.Nullable(t.String()),
	createdAt: DateSchema,
	updatedAt: DateSchema,
});
