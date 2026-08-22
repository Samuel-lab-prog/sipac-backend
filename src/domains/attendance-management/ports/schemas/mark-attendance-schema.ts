import { t } from 'elysia';

export const markAttendanceSchema = t.Object({
	classSessionId: t.Number(),
	studentProfileId: t.Number(),
	status: t.String({ examples: ['present'] }),
});
