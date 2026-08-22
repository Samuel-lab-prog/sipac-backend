import type {
	AcademicActivity,
	AcademicActivityAttachment,
	AcademicActivitySubmission,
	AttendanceRecord,
	AcademicPeriod,
	ClassOffering,
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from './models';
import type { AcademicPolicyContext } from '../use-cases/commands/policies';
import type { FileUploadUrlResult } from '@SharedKernel/ports/storage';
import type { Static } from 'elysia';
import { createAcademicActivityAttachmentUploadSchema } from './schemas';

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
export type MarkAttendanceBatchParams = AcademicPolicyContext & {
	classSessionId: number;
	attendances: Array<{
		studentProfileId: number;
		status: string;
	}>;
};
export type CreateAcademicPeriodParams = Omit<AcademicPeriod, 'id'>;
export type CreateClassOfferingParams = Omit<ClassOffering, 'id'>;
export type CreateAcademicActivityAttachmentParams = Omit<
	AcademicActivityAttachment,
	'id' | 'activityId'
>;
export type CreateAcademicActivityParams = Omit<AcademicActivity, 'id'> &
	AcademicPolicyContext & {
		attachments?: CreateAcademicActivityAttachmentParams[];
	};
export type CreateAcademicActivitySubmissionParams = AcademicPolicyContext & {
	activityId: number;
	studentProfileId: number;
	submittedAt?: Date | null;
};
export type CreateAcademicActivityAttachmentUploadParams =
	AcademicPolicyContext & {
		activityId: number;
		data: Static<typeof createAcademicActivityAttachmentUploadSchema>;
	};

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
	markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<import('@SharedKernel/types').CommandResult<AttendanceRecord[]>>;
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<import('@SharedKernel/types').CommandResult<AcademicPeriod>>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassOffering>>;
	createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<import('@SharedKernel/types').CommandResult<AcademicActivity>>;
	createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<
		import('@SharedKernel/types').CommandResult<AcademicActivitySubmission>
	>;
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
	markAttendanceBatch(
		params: MarkAttendanceBatchParams,
	): Promise<AttendanceRecord[]>;
	createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<AcademicPeriod>;
	createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<AcademicActivity>;
	createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<ClassOffering>;
	createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<AcademicActivitySubmission>;
	createAcademicActivityAttachmentUploadUrl(
		params: CreateAcademicActivityAttachmentUploadParams,
	): Promise<FileUploadUrlResult>;
}
