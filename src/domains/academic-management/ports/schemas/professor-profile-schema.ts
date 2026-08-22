import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const professorProfileSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	registryCode: t.Nullable(
		t.String({ minLength: 3, example: 'PROF-2026-001' }),
	),
	departmentId: t.Nullable(idSchema),
	title: t.Nullable(t.String({ minLength: 2, example: 'Dr.' })),
	workload: t.Nullable(t.Number({ minimum: 1, example: 40 })),
});
