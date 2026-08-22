import { t } from 'elysia';

export const createAcademicActivityAttachmentUploadSchema = t.Object({
	fileName: t.String({ minLength: 1, example: 'atividade-1.pdf' }),
	contentType: t.Optional(t.Literal('application/pdf')),
	contentLength: t.Optional(t.Number({ minimum: 1 })),
});
