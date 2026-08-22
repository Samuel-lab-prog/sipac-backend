import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createClassOfferingSchema = t.Object({
	courseId: idSchema,
	academicPeriodId: idSchema,
	shift: t.String(),
	term: t.String(),
	year: t.Number(),
	code: t.String(),
	title: t.String(),
});
