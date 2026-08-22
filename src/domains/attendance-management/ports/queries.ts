import type { AttendanceRecord } from './models';

export type AttendanceQueriesRepository = Record<string, never>;
export type AttendanceQueriesServices = {
	listAttendanceByClassSessionId(
		classSessionId: number,
	): Promise<AttendanceRecord[]>;
	listAttendanceByStudentProfileId(
		studentProfileId: number,
	): Promise<AttendanceRecord[]>;
};
