import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const createAcademicActivitySubmissionSchema = t.Object({
	studentProfileId: idSchema,
	submittedAt: t.Optional(dateSchema),
});
