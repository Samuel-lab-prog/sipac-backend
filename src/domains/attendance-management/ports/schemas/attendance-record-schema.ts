import { t } from 'elysia';

export const attendanceRecordSchema = t.Object({
	id: t.Number(),
	classSessionId: t.Number(),
	studentProfileId: t.Number(),
	status: t.String(),
	markedByProfessorProfileId: t.Union([t.Number(), t.Null()]),
});
