import { t } from 'elysia';

export const PoemAudioUploadUrlSchema = t.Object({
	uploadUrl: t.String(),
	fields: t.Record(t.String(), t.String()),
	fileUrl: t.String(),
});
