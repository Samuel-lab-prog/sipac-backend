import { dateSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createAcademicPeriodSchema = t.Object({
	code: t.String(),
	year: t.Number(),
	term: t.Number(),
	startsAt: dateSchema,
	endsAt: dateSchema,
});
