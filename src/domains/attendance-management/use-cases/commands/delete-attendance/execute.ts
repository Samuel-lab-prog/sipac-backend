import { NotFoundError } from '@DomainError';
import type { AttendanceCommandsRepository } from '../../../ports/commands';
import type { AttendanceRecord } from '../../../ports/models';
import { assertCanDeleteAttendance } from '../policies';

type DeleteAttendanceParams = {
	classSessionId: number;
	studentProfileId: number;
	actorId: number;
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'pending' | 'blocked' | 'suspended';
};

type Dependencies = {
	commandsRepository: AttendanceCommandsRepository;
};

export function deleteAttendanceFactory({ commandsRepository }: Dependencies) {
	return async function deleteAttendance(
		params: DeleteAttendanceParams,
	): Promise<AttendanceRecord> {
		assertCanDeleteAttendance({
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
		});

		const result = await commandsRepository.deleteAttendance(
			params.classSessionId,
			params.studentProfileId,
		);

		if (result.ok) return result.data;
		throw new NotFoundError('Attendance record not found');
	};
}
