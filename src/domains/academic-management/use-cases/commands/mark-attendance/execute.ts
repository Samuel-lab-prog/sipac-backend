import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { MarkAttendanceParams } from '../../../ports/commands';
import type { AttendanceRecord } from '../../../ports/models';
import { assertCanMarkAttendance } from '../policies';

interface Dependencies {
	commandsRepository: {
		markAttendance(params: {
			classSessionId: number;
			studentProfileId: number;
			status: string;
			markedByProfessorProfileId: number | null;
		}): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord>>;
	};
}

export function markAttendanceFactory({ commandsRepository }: Dependencies) {
	return async function markAttendance(
		params: MarkAttendanceParams,
	): Promise<AttendanceRecord> {
		assertCanMarkAttendance(params);
		const result = await commandsRepository.markAttendance({
			classSessionId: params.classSessionId,
			studentProfileId: params.studentProfileId,
			status: params.status,
			markedByProfessorProfileId: params.targetUserId,
		});
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Attendance target not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Attendance already registered',
			);
		throw new UnknownError(result.message ?? 'Failed to mark attendance');
	};
}
