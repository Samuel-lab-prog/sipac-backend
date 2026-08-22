import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const markAttendanceBatchSchema = t.Object({
	classSessionId: idSchema,
	attendances: t.Array(
		t.Object({
			studentProfileId: idSchema,
			status: t.String({ default: 'present' }),
		}),
	),
});
