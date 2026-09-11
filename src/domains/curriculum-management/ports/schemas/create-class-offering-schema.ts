import { t } from 'elysia';

export const createClassOfferingSchema = t.Object({
	courseId: t.Numeric({ minimum: 1, multipleOf: 1 }),
	academicPeriodId: t.Numeric({ minimum: 1, multipleOf: 1 }),
	shift: t.UnionEnum(['morning', 'afternoon', 'evening', 'integral']),
	term: t.String({ minLength: 1, maxLength: 20 }),
	year: t.Number({ minimum: 1900, maximum: 2100, multipleOf: 1 }),
	code: t.String({ minLength: 2, maxLength: 60, pattern: '\\S' }),
	title: t.String({ minLength: 3, maxLength: 160, pattern: '\\S' }),
});
