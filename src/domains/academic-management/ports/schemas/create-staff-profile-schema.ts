import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const createStaffProfileSchema = t.Object({
	departmentId: t.Nullable(idSchema),
});
