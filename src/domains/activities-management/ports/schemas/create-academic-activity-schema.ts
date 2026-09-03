import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createAcademicActivitySchema = t.Object({
	classOfferingId: idSchema,
	title: t.String({ minLength: 3, example: 'Lista 1 - Funções' }),
	description: t.Optional(t.String({ example: 'Responder até sexta-feira' })),
	dueAt: t.Optional(dateSchema),
	allowLateSubmissions: t.Optional(t.Boolean({ default: true })),
	createdByProfessorProfileId: t.Optional(idSchema),
});
