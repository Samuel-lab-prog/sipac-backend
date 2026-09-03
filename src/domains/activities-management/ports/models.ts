export type AcademicActivity = {
	id: number;
	classOfferingId: number;
	title: string;
	description: string | null;
	dueAt: Date | null;
	allowLateSubmissions: boolean;
	createdByProfessorProfileId: number | null;
};

export type AcademicActivitySubmission = {
	id: number;
	activityId: number;
	studentProfileId: number;
	submittedAt: Date | null;
	grade: string | null;
	feedback: string | null;
	attachments?: AcademicActivitySubmissionAttachment[];
	comments?: AcademicActivitySubmissionComment[];
};

export type AcademicActivitySubmissionComment = {
	id: number;
	submissionId: number;
	authorUserId: number;
	authorName: string;
	body: string;
	createdAt: Date;
	updatedAt: Date;
};

export type AcademicActivitySubmissionAttachment = {
	id: number;
	submissionId: number;
	fileName: string;
	fileUrl: string;
	fileKey?: string;
	contentType: string | null;
	fileSize: number | null;
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
