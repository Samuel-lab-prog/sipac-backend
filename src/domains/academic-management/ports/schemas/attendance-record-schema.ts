import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const attendanceRecordSchema = t.Object({
	id: idSchema,
	classSessionId: idSchema,
	studentProfileId: idSchema,
	status: t.String(),
	markedByProfessorProfileId: t.Nullable(idSchema),
});
