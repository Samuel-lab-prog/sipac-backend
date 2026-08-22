import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const staffProfileSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	departmentId: t.Nullable(idSchema),
});
