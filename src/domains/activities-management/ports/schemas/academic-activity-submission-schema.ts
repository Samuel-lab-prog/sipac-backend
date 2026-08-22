import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const academicActivitySubmissionSchema = t.Object({
	id: idSchema,
	activityId: idSchema,
	studentProfileId: idSchema,
	submittedAt: t.Nullable(dateSchema),
	grade: t.Nullable(t.String({ example: '10.00' })),
	feedback: t.Nullable(t.String({ example: 'Bom trabalho' })),
});
