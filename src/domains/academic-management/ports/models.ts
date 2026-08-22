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

export type AcademicPeriod = {
	id: number;
	code: string;
	year: number;
	term: number;
	startsAt: Date;
	endsAt: Date;
};

export type ClassOffering = {
	id: number;
	courseId: number;
	academicPeriodId: number;
	shift: 'morning' | 'afternoon' | 'evening' | 'integral';
	term: string;
	year: number;
	code: string;
	title: string;
};

export type AcademicActivityAttachment = {
	id: number;
	activityId: number;
	fileName: string;
	fileUrl: string;
	fileKey: string;
	contentType: string | null;
	fileSize: number | null;
};

export type AcademicActivity = {
	id: number;
	classOfferingId: number;
	title: string;
	description: string | null;
	dueAt: Date | null;
	createdByProfessorProfileId: number | null;
};

export type AcademicActivitySubmission = {
	id: number;
	activityId: number;
	studentProfileId: number;
	submittedAt: Date | null;
	grade: string | null;
	feedback: string | null;
};
