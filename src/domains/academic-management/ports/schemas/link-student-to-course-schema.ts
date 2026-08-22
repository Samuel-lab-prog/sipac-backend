import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const linkStudentToCourseSchema = t.Object({
	courseId: t.Nullable(idSchema),
});
