import type { AttendanceRecord } from './models';
import type { AcademicPolicyContext } from '../../academic-management/use-cases/commands/policies';

export type MarkAttendanceParams = AcademicPolicyContext & {
	classSessionId: number;
	studentProfileId: number;
	status: string;
};

export type MarkAttendanceBatchParams = AcademicPolicyContext & {
	classSessionId: number;
	attendances: Array<{
		studentProfileId: number;
		status: string;
	}>;
};

export interface AttendanceCommandsRepository {
	markAttendance(params: {
		classSessionId: number;
		studentProfileId: number;
		status: string;
		markedByProfessorProfileId: number | null;
	}): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord>>;
	markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord[]>>;
}

export interface AttendanceCommandsServices {
	markAttendance(params: MarkAttendanceParams): Promise<AttendanceRecord>;
	markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<AttendanceRecord[]>;
}
