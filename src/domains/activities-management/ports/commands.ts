import type {
	AcademicActivity,
	AcademicActivitySubmission,
	AcademicActivitySubmissionAttachment,
	AcademicActivitySubmissionComment,
} from './models';
import type { AcademicPolicyContext } from '@Domains/academic-management/public';
import type { FileUploadUrlResult } from '@SharedKernel/ports/storage';
import type { Static } from 'elysia';
import { createAcademicActivitySubmissionUploadSchema } from './schemas';

export type CreateAcademicActivityParams = Omit<AcademicActivity, 'id'> &
	AcademicPolicyContext;

export type CreateAcademicActivitySubmissionParams = AcademicPolicyContext & {
	activityId: number;
	studentProfileId: number;
	submittedAt?: Date | null;
	attachments?: Omit<
		AcademicActivitySubmissionAttachment,
		'id' | 'submissionId'
	>[];
};

export type CreateAcademicActivitySubmissionCommentParams =
	AcademicPolicyContext & {
		submissionId: number;
		body: string;
	};

export type CreateAcademicActivitySubmissionUploadParams =
	AcademicPolicyContext & {
		activityId: number;
		data: Static<typeof createAcademicActivitySubmissionUploadSchema>;
	};

export interface ActivitiesCommandsRepository {
	createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<import('@SharedKernel/types').CommandResult<AcademicActivity>>;
	createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<
		import('@SharedKernel/types').CommandResult<AcademicActivitySubmission>
	>;
	createAcademicActivitySubmissionComment(
		params: CreateAcademicActivitySubmissionCommentParams,
	): Promise<
		import('@SharedKernel/types').CommandResult<AcademicActivitySubmissionComment>
	>;
	selectAcademicActivitiesByClassOfferingId(
		classOfferingId: number,
	): Promise<AcademicActivity[]>;
	selectAcademicActivityById(
		activityId: number,
	): Promise<AcademicActivity | null>;
	selectAcademicActivitySubmissionsByStudentProfileId(
		studentProfileId: number,
	): Promise<AcademicActivitySubmission[]>;
}

export interface ActivitiesCommandsServices {
	createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<AcademicActivity>;
	createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<AcademicActivitySubmission>;
	createAcademicActivitySubmissionComment(
		params: CreateAcademicActivitySubmissionCommentParams,
	): Promise<AcademicActivitySubmissionComment>;
	createAcademicActivitySubmissionUploadUrl(
		params: CreateAcademicActivitySubmissionUploadParams,
	): Promise<FileUploadUrlResult>;
}
