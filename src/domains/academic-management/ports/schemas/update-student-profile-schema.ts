import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const updateStudentProfileSchema = t.Object({
	academicId: t.Optional(t.String({ minLength: 3, example: '2026000456' })),
	courseId: t.Optional(t.Nullable(idSchema)),
	admissionYear: t.Optional(
		t.Nullable(t.Number({ minimum: 1900, maximum: 2100, example: 2025 })),
	),
	status: t.Optional(t.String({ example: 'active' })),
});
