import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const createStudentProfileSchema = t.Object({
	academicId: t.String({ minLength: 3, example: '2026000123' }),
	courseId: t.Nullable(idSchema),
	admissionYear: t.Nullable(
		t.Number({ minimum: 1900, maximum: 2100, example: 2026 }),
	),
	status: t.String({ example: 'active' }),
});
