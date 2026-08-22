import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const updateStaffProfileSchema = t.Object({
	departmentId: t.Optional(t.Nullable(idSchema)),
});
