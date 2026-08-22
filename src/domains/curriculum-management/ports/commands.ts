import type { AcademicPeriod, ClassOffering } from './models';

export type CreateAcademicPeriodParams = Omit<AcademicPeriod, 'id'>;
export type CreateClassOfferingParams = Omit<ClassOffering, 'id'>;

export interface CurriculumCommandsRepository {
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<import('@SharedKernel/types').CommandResult<AcademicPeriod>>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassOffering>>;
}

export interface CurriculumCommandsServices {
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<AcademicPeriod>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<ClassOffering>;
}
