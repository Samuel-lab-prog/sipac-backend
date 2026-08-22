import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

const admissionYearSchema = t.Number({
	minimum: 1900,
	maximum: 2100,
	example: 2026,
});

export const studentProfileSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	academicId: t.String({ minLength: 3, example: '2026000123' }),
	courseId: t.Nullable(idSchema),
	admissionYear: t.Nullable(admissionYearSchema),
	status: t.String({ example: 'active' }),
});
