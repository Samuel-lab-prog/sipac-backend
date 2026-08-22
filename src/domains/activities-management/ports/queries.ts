import type { AcademicActivity, AcademicActivitySubmission } from './models';

export type ActivitiesQueriesRepository = Record<string, never>;
export type ActivitiesQueriesServices = {
	listAcademicActivitiesByClassOfferingId(
		classOfferingId: number,
	): Promise<AcademicActivity[]>;
	listAcademicActivitySubmissionsByStudentProfileId(
		studentProfileId: number,
	): Promise<AcademicActivitySubmission[]>;
};
