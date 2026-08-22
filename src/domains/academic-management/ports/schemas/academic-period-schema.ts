import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const academicPeriodSchema = t.Object({
	id: idSchema,
	code: t.String(),
	year: t.Number(),
	term: t.Number(),
	startsAt: dateSchema,
	endsAt: dateSchema,
});
