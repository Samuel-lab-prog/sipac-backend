import type {
	AttendanceRecord,
	AcademicPeriod,
	ClassOffering,
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from './models';
import type { AcademicPolicyContext } from '../use-cases/commands/policies';

export type CreateStudentProfileParams = Omit<StudentProfile, 'id'>;
export type CreateStudentProfileUseCaseParams = CreateStudentProfileParams &
	AcademicPolicyContext;
export type CreateProfessorProfileUseCaseParams = Omit<ProfessorProfile, 'id'> &
	AcademicPolicyContext;
export type CreateStaffProfileUseCaseParams = Omit<StaffProfile, 'id'> &
	AcademicPolicyContext;
export type UpdateStudentProfileParams = Partial<CreateStudentProfileParams> &
	AcademicPolicyContext;
export type UpdateProfessorProfileParams = Partial<
	Omit<ProfessorProfile, 'id' | 'userId'>
> &
	AcademicPolicyContext;
export type UpdateStaffProfileParams = Partial<
	Omit<StaffProfile, 'id' | 'userId'>
> &
	AcademicPolicyContext;
export type LinkStudentToCourseParams = AcademicPolicyContext & {
	courseId: number | null;
};
export type LinkProfessorToDepartmentParams = AcademicPolicyContext & {
	departmentId: number | null;
};
export type UnlinkStudentFromCourseParams = AcademicPolicyContext;
export type UnlinkProfessorFromDepartmentParams = AcademicPolicyContext;
export type MarkAttendanceParams = AcademicPolicyContext & {
	classSessionId: number;
	studentProfileId: number;
	status: string;
};
export type CreateAcademicPeriodParams = Omit<AcademicPeriod, 'id'>;
export type CreateClassOfferingParams = Omit<ClassOffering, 'id'>;

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
	updateStudentProfile(
		userId: number,
		params: Partial<CreateStudentProfileParams>,
	): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	updateProfessorProfile(
		userId: number,
		params: Partial<Omit<ProfessorProfile, 'id' | 'userId'>>,
	): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	updateStaffProfile(
		userId: number,
		params: Partial<Omit<StaffProfile, 'id' | 'userId'>>,
	): Promise<import('@SharedKernel/types').CommandResult<StaffProfile>>;
	linkStudentToCourse(
		userId: number,
		params: Pick<StudentProfile, 'courseId'>,
	): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	linkProfessorToDepartment(
		userId: number,
		params: Pick<ProfessorProfile, 'departmentId'>,
	): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	unlinkStudentFromCourse(
		userId: number,
	): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	unlinkProfessorFromDepartment(
		userId: number,
	): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	markAttendance(params: {
		classSessionId: number;
		studentProfileId: number;
		status: string;
		markedByProfessorProfileId: number | null;
	}): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord>>;
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<import('@SharedKernel/types').CommandResult<AcademicPeriod>>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassOffering>>;
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
	updateStudentProfile(
		params: UpdateStudentProfileParams,
	): Promise<StudentProfile>;
	updateProfessorProfile(
		params: UpdateProfessorProfileParams,
	): Promise<ProfessorProfile>;
	updateStaffProfile(params: UpdateStaffProfileParams): Promise<StaffProfile>;
	linkStudentToCourse(
		params: LinkStudentToCourseParams,
	): Promise<StudentProfile>;
	linkProfessorToDepartment(
		params: LinkProfessorToDepartmentParams,
	): Promise<ProfessorProfile>;
	unlinkStudentFromCourse(
		params: UnlinkStudentFromCourseParams,
	): Promise<StudentProfile>;
	unlinkProfessorFromDepartment(
		params: UnlinkProfessorFromDepartmentParams,
	): Promise<ProfessorProfile>;
	markAttendance(params: MarkAttendanceParams): Promise<AttendanceRecord>;
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<AcademicPeriod>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<ClassOffering>;
}
