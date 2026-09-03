import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createAcademicActivitySubmissionSchema = t.Object({
	studentProfileId: idSchema,
	submittedAt: t.Optional(dateSchema),
	attachments: t.Optional(
		t.Array(
			t.Object({
				fileName: t.String({ minLength: 1 }),
				fileUrl: t.String({ format: 'uri' }),
				fileKey: t.Optional(t.String({ minLength: 1 })),
				contentType: t.Optional(t.String()),
				fileSize: t.Optional(t.Number({ minimum: 1 })),
			}),
		),
	),
});
