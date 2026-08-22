import { dateSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const updateClassSessionSchema = t.Object({
	startsAt: t.Optional(dateSchema),
	endsAt: t.Optional(t.Union([dateSchema, t.Null()])),
	topic: t.Optional(t.Union([t.String(), t.Null()])),
});
