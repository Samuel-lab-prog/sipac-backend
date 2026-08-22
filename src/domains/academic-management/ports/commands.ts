import type { ProfessorProfile, StaffProfile, StudentProfile } from './models';
import type { AcademicPolicyContext } from '../use-cases/commands/policies';

export type CreateStudentProfileParams = Omit<StudentProfile, 'id'>;
export type CreateStudentProfileUseCaseParams = CreateStudentProfileParams &
	AcademicPolicyContext;
export type CreateProfessorProfileUseCaseParams = Omit<ProfessorProfile, 'id'> &
	AcademicPolicyContext;
export type CreateStaffProfileUseCaseParams = Omit<StaffProfile, 'id'> &
	AcademicPolicyContext;

export interface AcademicCommandsRepository {
	insertStudentProfile: (
		params: CreateStudentProfileParams,
	) => Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	createProfessorProfile(
		params: Omit<ProfessorProfile, 'id'>,
	): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	createStaffProfile(
		params: Omit<StaffProfile, 'id'>,
	): Promise<import('@SharedKernel/types').CommandResult<StaffProfile>>;
}

export interface AcademicCommandsServices {
	createStudentProfile(
		params: CreateStudentProfileUseCaseParams,
	): Promise<StudentProfile>;
	createProfessorProfile(
		params: CreateProfessorProfileUseCaseParams,
	): Promise<ProfessorProfile>;
	createStaffProfile(
		params: CreateStaffProfileUseCaseParams,
	): Promise<StaffProfile>;
}
