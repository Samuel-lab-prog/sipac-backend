import type {
	AcademicActivity,
	AcademicActivitySubmission,
} from './models';
import type { AcademicPolicyContext } from '../../academic-management/use-cases/commands/policies';

export type CreateAcademicActivityParams = Omit<AcademicActivity, 'id'> &
	AcademicPolicyContext;

export type CreateAcademicActivitySubmissionParams = AcademicPolicyContext & {
	activityId: number;
	studentProfileId: number;
	submittedAt?: Date | null;
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
}

export interface ActivitiesCommandsServices {
	createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<AcademicActivity>;
	createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<AcademicActivitySubmission>;
}
