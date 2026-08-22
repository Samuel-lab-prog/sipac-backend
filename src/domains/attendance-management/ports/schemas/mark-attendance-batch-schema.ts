import { t } from 'elysia';

export const markAttendanceBatchSchema = t.Object({
	classSessionId: t.Number(),
	attendances: t.Array(
		t.Object({
			studentProfileId: t.Number(),
			status: t.String({ examples: ['present'] }),
		}),
	),
});
