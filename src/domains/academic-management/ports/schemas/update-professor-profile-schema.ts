import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const updateProfessorProfileSchema = t.Object({
	registryCode: t.Optional(
		t.Nullable(t.String({ minLength: 3, example: 'PROF-2026-002' })),
	),
	departmentId: t.Optional(t.Nullable(idSchema)),
	title: t.Optional(t.Nullable(t.String({ minLength: 2, example: 'MSc.' }))),
	workload: t.Optional(t.Nullable(t.Number({ minimum: 1, example: 20 }))),
});
