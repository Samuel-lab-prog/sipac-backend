import { t } from 'elysia';

export const createAcademicActivitySubmissionUploadResponseSchema = t.Object({
	uploadUrl: t.String({ format: 'uri' }),
	fields: t.Record(t.String(), t.String()),
	fileUrl: t.String({ format: 'uri' }),
});
