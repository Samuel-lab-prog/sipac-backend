import { t } from 'elysia';
import { avatarUrlSchema } from '../field-schemas';

export const avatarUploadParamsSchema = t.Object({});

export const avatarUploadRequestSchema = t.Object({
	contentType: t.Optional(t.String()),
	contentLength: t.Optional(t.Number({ minimum: 1 })),
});

export const avatarUploadResponseSchema = t.Object({
	uploadUrl: t.String({ format: 'uri' }),
	fields: t.Record(t.String(), t.String()),
	fileUrl: avatarUrlSchema,
});
