import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { MarkAttendanceBatchParams } from '../../../ports/commands';
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

export function markAttendanceBatchFactory({
	commandsRepository,
}: Dependencies) {
	return async function markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<AttendanceRecord[]> {
		assertCanMarkAttendance(params);
		const results = await Promise.all(
			params.attendances.map((attendance) =>
				commandsRepository.markAttendance({
					classSessionId: params.classSessionId,
					studentProfileId: attendance.studentProfileId,
					status: attendance.status,
					markedByProfessorProfileId: params.targetUserId,
				}),
			),
		);
		return results.map((result) => {
			if (result.ok) return result.data;
			if (result.code === 'NOT_FOUND')
				throw new NotFoundError('Attendance target not found');
			if (result.code === 'CONFLICT')
				throw new ConflictError(
					result.message ?? 'Attendance already registered',
				);
			throw new UnknownError(result.message ?? 'Failed to mark attendance');
		});
	};
}
