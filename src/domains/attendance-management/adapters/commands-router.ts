import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type {
	AttendanceCommandsServices,
	DeleteAttendanceParams,
	MarkAttendanceBatchParams,
	MarkAttendanceParams,
} from '../ports/commands';
import {
	attendanceRecordSchema,
	markAttendanceBatchSchema,
	markAttendanceSchema,
} from '../ports/schemas';

export function createAttendanceCommandsRouter(
	services: AttendanceCommandsServices,
) {
	return new Elysia({ prefix: '/attendance' })
		.use(authPlugin)
		.post(
			'/',
			({ body, auth, set }) => {
				set.status = 201;
				return services.markAttendance({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as MarkAttendanceParams);
			},
			{
				body: markAttendanceSchema,
				response: {
					201: attendanceRecordSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Mark Attendance',
					tags: ['Attendance Management'],
				},
			},
		)
		.post(
			'/batch',
			({ body, auth, set }) => {
				set.status = 201;
				return services.markAttendanceBatch({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as MarkAttendanceBatchParams);
			},
			{
				body: markAttendanceBatchSchema,
				response: {
					201: t.Array(attendanceRecordSchema),
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Mark Attendance Batch',
					tags: ['Attendance Management'],
				},
			},
		)
		.delete(
			'/:classSessionId/students/:studentProfileId',
			({ params, auth }) =>
				services.deleteAttendance({
					classSessionId: Number(params.classSessionId),
					studentProfileId: Number(params.studentProfileId),
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
				} as DeleteAttendanceParams),
			{
				params: t.Object({
					classSessionId: t.Numeric(),
					studentProfileId: t.Numeric(),
				}),
				response: {
					200: attendanceRecordSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Delete Attendance',
					tags: ['Attendance Management'],
				},
			},
		);
}
