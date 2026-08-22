import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import {
	attendanceRecordSchema,
	markAttendanceBatchSchema,
	markAttendanceSchema,
} from '../ports/schemas';
import type {
	AttendanceCommandsServices,
	MarkAttendanceParams,
	MarkAttendanceBatchParams,
} from '../ports/commands';

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
		);
}
