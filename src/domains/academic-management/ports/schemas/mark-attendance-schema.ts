import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const markAttendanceSchema = t.Object({
	classSessionId: idSchema,
	studentProfileId: idSchema,
	status: t.String({ default: 'present' }),
});
