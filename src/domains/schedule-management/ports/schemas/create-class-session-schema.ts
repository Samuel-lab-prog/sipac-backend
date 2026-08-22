import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createClassSessionSchema = t.Object({
	classOfferingId: idSchema,
	startsAt: dateSchema,
	endsAt: t.Optional(t.Union([dateSchema, t.Null()])),
	topic: t.Optional(t.Union([t.String(), t.Null()])),
});
