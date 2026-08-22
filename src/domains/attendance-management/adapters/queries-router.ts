import { appErrorSchema } from '@AppError';
import { Elysia, t } from 'elysia';
import type { AttendanceQueriesServices } from '../ports/queries';
import { attendanceRecordSchema } from '../ports/schemas';

export function createAttendanceQueriesRouter(
	services: AttendanceQueriesServices,
) {
	return new Elysia({ prefix: '/attendance' })
		.get(
			'/class-sessions/:classSessionId/records',
			({ params }) =>
				services.listAttendanceByClassSessionId(Number(params.classSessionId)),
			{
				params: t.Object({ classSessionId: t.Numeric() }),
				response: {
					200: t.Array(attendanceRecordSchema),
					404: appErrorSchema,
				},
				detail: {
					summary: 'List Attendance By Class Session',
					tags: ['Attendance Management'],
				},
			},
		)
		.get(
			'/students/:studentProfileId/records',
			({ params }) =>
				services.listAttendanceByStudentProfileId(
					Number(params.studentProfileId),
				),
			{
				params: t.Object({ studentProfileId: t.Numeric() }),
				response: {
					200: t.Array(attendanceRecordSchema),
					404: appErrorSchema,
				},
				detail: {
					summary: 'List Attendance By Student',
					tags: ['Attendance Management'],
				},
			},
		);
}
