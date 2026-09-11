import type { ProfessorProfile, StaffProfile, StudentProfile } from './models';
import type { AcademicActivitySubmissionComment } from '@Domains/activities-management/ports/models';

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
	plan: StudentCoursePlan | null;
};

export type StudentCoursePlan = {
	id: number;
	syllabus: string | null;
	status: string;
	generalObjectives?: string | null;
	methodology?: string | null;
	assessmentCriteria?: string | null;
	workloadMinutes?: number | null;
	units: Array<{
		id: number;
		title: string;
		description: string | null;
		position: number;
		topics: Array<{
			id: number;
			title: string;
			description: string | null;
			position: number;
			type: string;
		}>;
	}>;
};

export type StudentDashboardClassOffering = {
	id: number;
	title: string;
	code: string;
	year: number;
	term: string;
	shift: 'morning' | 'afternoon' | 'evening' | 'integral';
	courseId: number;
	academicPeriod?: {
		id: number;
		code: string;
		year: number;
		term: number;
		startsAt: Date;
		endsAt: Date;
	};
	professors?: Array<{ id: number; name: string }>;
};

export type StudentDashboardActivity = {
	id: number;
	title: string;
	description: string | null;
	dueAt: Date | null;
	kind?: 'activity' | 'assessment';
	assessmentType?: string | null;
	appliesAt?: Date | null;
	maxGrade?: number | null;
	weight?: number | null;
	coursePlanUnitId?: number | null;
	coursePlanTopicId?: number | null;
	classSessionId?: number | null;
	attachments?: Array<{ id: number; fileName: string; fileUrl: string }>;
	allowLateSubmissions: boolean;
};

export type StudentDashboardSession = {
	id: number;
	coursePlanTopicId: number | null;
	startsAt: Date;
	endsAt: Date | null;
	topic: string | null;
	status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'missed';
	deliveredContent?: string | null;
	room?: string | null;
	publicNotes?: string | null;
	replacesSessionId?: number | null;
	materials?: Array<{ id: number; title: string; url: string }>;
};

export type StudentDashboardSubmission = {
	id: number;
	activityId: number;
	submittedAt: Date | null;
	grade: string | null;
	feedback: string | null;
	comments: AcademicActivitySubmissionComment[];
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
