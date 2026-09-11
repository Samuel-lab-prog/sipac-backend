import { t } from 'elysia';
import { classOfferingSchema } from './class-offering-schema';
import { academicPeriodSchema } from './academic-period-schema';

export const positiveId = t.Numeric({ minimum: 1, multipleOf: 1 });
export const classParams = t.Object({ classId: positiveId });
export const pageQuery = {
	page: t.Optional(
		t.Numeric({ minimum: 1, maximum: 100000, multipleOf: 1, default: 1 }),
	),
	q: t.Optional(t.String({ maxLength: 100 })),
};
export const classListQuery = t.Object({
	...pageQuery,
	academicPeriodId: t.Optional(positiveId),
	courseId: t.Optional(positiveId),
});
export const lookupQuery = t.Object({
	...pageQuery,
	courseId: t.Optional(positiveId),
});
export const courseOptionSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	code: t.String(),
});
export const professorOptionSchema = t.Object({
	id: t.Number(),
	name: t.String(),
});
export const studentOptionSchema = t.Object({
	id: t.Number(),
	name: t.String(),
	academicId: t.String(),
	courseId: t.Nullable(t.Number()),
});
// Flatten extended objects: Elysia closes response objects during compilation.
// Intersecting a reused write schema would then reject the read-only relation fields.
export const classSummarySchema = t.Object({
	...classOfferingSchema.properties,
	course: courseOptionSchema,
	academicPeriod: academicPeriodSchema,
	activeEnrollments: t.Number(),
	professors: t.Array(professorOptionSchema),
});
export const enrollmentSchema = t.Object({
	id: t.Number(),
	studentProfileId: t.Number(),
	classOfferingId: t.Number(),
	status: t.String(),
});
export const rosterSchema = t.Object({
	...enrollmentSchema.properties,
	student: studentOptionSchema,
});
export const classPageSchema = t.Object({
	items: t.Array(classSummarySchema),
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
});
export const rosterPageSchema = t.Object({
	items: t.Array(rosterSchema),
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
});
export const studentsPageSchema = t.Object({
	items: t.Array(studentOptionSchema),
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
});
export const professorsPageSchema = t.Object({
	items: t.Array(professorOptionSchema),
	total: t.Number(),
	page: t.Number(),
	pageSize: t.Number(),
});
export const editClassSchema = t.Object({
	title: t.String({ minLength: 3, maxLength: 160, pattern: '\\S' }),
	code: t.String({ minLength: 2, maxLength: 60, pattern: '\\S' }),
	shift: t.UnionEnum(['morning', 'afternoon', 'evening', 'integral']),
});
export const enrollmentStatusSchema = t.Object({
	status: t.UnionEnum(['active', 'completed', 'cancelled', 'inactive']),
});
