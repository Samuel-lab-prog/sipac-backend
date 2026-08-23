import type { AttendanceRecord } from './models';
import type { AcademicPolicyContext } from '@Domains/academic-management/public';

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

export type DeleteAttendanceParams = {
	classSessionId: number;
	studentProfileId: number;
	actorId: number;
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'pending' | 'blocked' | 'suspended';
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
	selectAttendanceByClassSessionId(
		classSessionId: number,
	): Promise<AttendanceRecord[]>;
	selectAttendanceByStudentProfileId(
		studentProfileId: number,
	): Promise<AttendanceRecord[]>;
	deleteAttendance(
		classSessionId: number,
		studentProfileId: number,
	): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord>>;
}

export interface AttendanceCommandsServices {
	markAttendance(params: MarkAttendanceParams): Promise<AttendanceRecord>;
	markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<AttendanceRecord[]>;
	deleteAttendance(params: DeleteAttendanceParams): Promise<AttendanceRecord>;
}
