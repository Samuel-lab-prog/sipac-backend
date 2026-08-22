import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type { DeleteAttendanceParams } from '../ports/commands';
import { attendanceRecordSchema } from '../ports/schemas';

type DeleteAttendanceCommandsServices = {
	deleteAttendance(
		params: DeleteAttendanceParams,
	): Promise<import('../ports/models').AttendanceRecord>;
};

export function createDeleteAttendanceCommandsRouter(
	services: DeleteAttendanceCommandsServices,
) {
	return new Elysia({ prefix: '/attendance' }).use(authPlugin).delete(
		'/:classSessionId/students/:studentProfileId',
		({ params, auth }) =>
			services.deleteAttendance({
				classSessionId: Number(params.classSessionId),
				studentProfileId: Number(params.studentProfileId),
				actorId: auth.clientId,
				actorRole: auth.clientRole,
				actorStatus: auth.clientStatus,
			}),
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
