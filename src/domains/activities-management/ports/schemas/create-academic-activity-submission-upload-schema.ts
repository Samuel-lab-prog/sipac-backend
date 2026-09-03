import { t } from 'elysia';

export const createAcademicActivitySubmissionUploadSchema = t.Object({
	fileName: t.String({ minLength: 1 }),
	contentType: t.Optional(t.String()),
	contentLength: t.Optional(t.Number({ minimum: 1 })),
});
