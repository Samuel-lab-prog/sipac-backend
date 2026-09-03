import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const academicActivitySchema = t.Object({
	id: idSchema,
	classOfferingId: idSchema,
	title: t.String({ example: 'Lista 1 - Funções' }),
	description: t.Nullable(t.String({ example: 'Responder até sexta-feira' })),
	dueAt: t.Nullable(dateSchema),
	allowLateSubmissions: t.Boolean(),
	createdByProfessorProfileId: t.Nullable(idSchema),
});
