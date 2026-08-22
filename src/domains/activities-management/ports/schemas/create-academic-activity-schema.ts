import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createAcademicActivityAttachmentSchema = t.Object({
	fileName: t.String({ minLength: 1, example: 'atividade-1.pdf' }),
	fileUrl: t.String({
		format: 'uri',
		example: 'https://cdn.example.com/academic-activities/1/atividade-1.pdf',
	}),
	fileKey: t.String({
		minLength: 1,
		example: 'academic-activities/abc123-atividade-1.pdf',
	}),
	contentType: t.Optional(t.String({ example: 'application/pdf' })),
	fileSize: t.Optional(t.Number({ minimum: 1, example: 123456 })),
});

export const createAcademicActivitySchema = t.Object({
	classOfferingId: idSchema,
	title: t.String({ minLength: 3, example: 'Lista 1 - Funções' }),
	description: t.Optional(t.String({ example: 'Responder até sexta-feira' })),
	dueAt: t.Optional(dateSchema),
	createdByProfessorProfileId: t.Optional(idSchema),
	attachments: t.Optional(t.Array(createAcademicActivityAttachmentSchema)),
});
