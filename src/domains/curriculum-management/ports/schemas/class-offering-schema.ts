import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const classOfferingSchema = t.Object({
	id: idSchema,
	courseId: idSchema,
	academicPeriodId: idSchema,
	shift: t.UnionEnum(['morning', 'afternoon', 'evening', 'integral']),
	term: t.String(),
	year: t.Number(),
	code: t.String(),
	title: t.String(),
});
