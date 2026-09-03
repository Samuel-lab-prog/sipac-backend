import type { ProfessorProfile, StaffProfile, StudentProfile } from './models';

export type StudentDashboard = {
	profile: StudentProfile;
	userName: string;
	courseLevel: string | null;
	attendanceSummary: StudentDashboardAttendanceSummary;
	enrollments: StudentEnrollment[];
	submissions: StudentDashboardSubmission[];
};

export type StudentDashboardAttendanceSummary = {
	totalRecords: number;
	presentRecords: number;
	percentage: number;
};

export type StudentEnrollment = {
	id: number;
	status: string;
	classOffering: StudentDashboardClassOffering;
	activities: StudentDashboardActivity[];
	sessions: StudentDashboardSession[];
};

export type StudentDashboardClassOffering = {
	id: number;
	title: string;
	code: string;
	year: number;
	term: string;
	shift: 'morning' | 'afternoon' | 'evening' | 'integral';
	courseId: number;
};

export type StudentDashboardActivity = {
	id: number;
	title: string;
	description: string | null;
	dueAt: Date | null;
	allowLateSubmissions: boolean;
};

export type StudentDashboardSession = {
	id: number;
	startsAt: Date;
	endsAt: Date | null;
	topic: string | null;
};

export type StudentDashboardSubmission = {
	id: number;
	activityId: number;
	submittedAt: Date | null;
	grade: string | null;
	feedback: string | null;
};

export interface AcademicQueriesRepository {
	selectStudentProfileByUserId(userId: number): Promise<StudentProfile | null>;
	selectProfessorProfileByUserId(
		userId: number,
	): Promise<ProfessorProfile | null>;
	selectStaffProfileByUserId(userId: number): Promise<StaffProfile | null>;
	selectStudentDashboardByUserId(
		userId: number,
	): Promise<StudentDashboard | null>;
}

export interface AcademicQueriesServices {
	getStudentProfileByUserId(userId: number): Promise<StudentProfile>;
	getProfessorProfileByUserId(userId: number): Promise<ProfessorProfile>;
	getStaffProfileByUserId(userId: number): Promise<StaffProfile>;
	getStudentDashboardByUserId(userId: number): Promise<StudentDashboard>;
}
