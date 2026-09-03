import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const academicActivitySubmissionSchema = t.Object({
	id: idSchema,
	activityId: idSchema,
	studentProfileId: idSchema,
	submittedAt: t.Nullable(dateSchema),
	grade: t.Nullable(t.String({ example: '10.00' })),
	feedback: t.Nullable(t.String({ example: 'Bom trabalho' })),
	attachments: t.Optional(
		t.Array(
			t.Object({
				id: idSchema,
				submissionId: idSchema,
				fileName: t.String(),
				fileUrl: t.String({ format: 'uri' }),
				fileKey: t.Optional(t.String()),
				contentType: t.Nullable(t.String()),
				fileSize: t.Nullable(t.Number()),
			}),
		),
	),
});
