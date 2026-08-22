import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

export const linkProfessorToDepartmentSchema = t.Object({
	departmentId: t.Nullable(idSchema),
});
