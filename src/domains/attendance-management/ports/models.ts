export type AttendanceRecord = {
	id: number;
	classSessionId: number;
	studentProfileId: number;
	status: string;
	markedByProfessorProfileId: number | null;
};
