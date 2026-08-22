import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const classSessionSchema = t.Object({
	id: idSchema,
	classOfferingId: idSchema,
	startsAt: dateSchema,
	endsAt: t.Nullable(dateSchema),
	topic: t.Nullable(t.String()),
});
