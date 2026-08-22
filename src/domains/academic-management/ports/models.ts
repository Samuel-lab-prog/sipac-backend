export type StudentProfile = {
	id: number;
	userId: number;
	academicId: string;
	courseId: number | null;
	admissionYear: number | null;
	status: string;
};

export type ProfessorProfile = {
	id: number;
	userId: number;
	registryCode: string | null;
	departmentId: number | null;
	title: string | null;
	workload: number | null;
};

export type StaffProfile = {
	id: number;
	userId: number;
	departmentId: number | null;
};

export type AttendanceRecord = {
	id: number;
	classSessionId: number;
	studentProfileId: number;
	status: string;
	markedByProfessorProfileId: number | null;
};
