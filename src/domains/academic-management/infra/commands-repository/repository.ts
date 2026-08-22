import { prisma } from '@Prisma';
import { withPrismaErrorHandling, withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type {
	AttendanceRecord,
	AcademicPeriod,
	ClassOffering,
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from '../../ports/models';
import type { AcademicCommandsRepository } from '../../ports/commands';
import type { AcademicQueriesRepository } from '../../ports/queries';

export function insertStudentProfile(
	profile: Omit<StudentProfile, 'id'>,
): Promise<CommandResult<StudentProfile>> {
	return withPrismaResult(() =>
		prisma.studentProfile.create({
			data: profile,
		}),
	);
}

export function selectStudentProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.studentProfile.findUnique({
			where: { userId },
		}),
	);
}

export function insertProfessorProfile(
	profile: Omit<ProfessorProfile, 'id'>,
): Promise<CommandResult<ProfessorProfile>> {
	return withPrismaResult(() =>
		prisma.professorProfile.create({
			data: profile,
		}),
	);
}

export function selectProfessorProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.professorProfile.findUnique({
			where: { userId },
		}),
	);
}

export function insertStaffProfile(
	profile: Omit<StaffProfile, 'id'>,
): Promise<CommandResult<StaffProfile>> {
	return withPrismaResult(() =>
		prisma.staffProfile.create({
			data: profile,
		}),
	);
}

export function selectStaffProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.staffProfile.findUnique({
			where: { userId },
		}),
	);
}

export function updateStudentProfile(
	userId: number,
	params: Partial<Omit<StudentProfile, 'id' | 'userId'>>,
): Promise<CommandResult<StudentProfile>> {
	return withPrismaResult(() =>
		prisma.studentProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function updateProfessorProfile(
	userId: number,
	params: Partial<Omit<ProfessorProfile, 'id' | 'userId'>>,
): Promise<CommandResult<ProfessorProfile>> {
	return withPrismaResult(() =>
		prisma.professorProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function updateStaffProfile(
	userId: number,
	params: Partial<Omit<StaffProfile, 'id' | 'userId'>>,
): Promise<CommandResult<StaffProfile>> {
	return withPrismaResult(() =>
		prisma.staffProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function linkStudentToCourse(
	userId: number,
	params: Pick<StudentProfile, 'courseId'>,
): Promise<CommandResult<StudentProfile>> {
	return updateStudentProfile(userId, params);
}

export function linkProfessorToDepartment(
	userId: number,
	params: Pick<ProfessorProfile, 'departmentId'>,
): Promise<CommandResult<ProfessorProfile>> {
	return updateProfessorProfile(userId, params);
}

export function unlinkStudentFromCourse(
	userId: number,
): Promise<CommandResult<StudentProfile>> {
	return updateStudentProfile(userId, { courseId: null });
}

export function unlinkProfessorFromDepartment(
	userId: number,
): Promise<CommandResult<ProfessorProfile>> {
	return updateProfessorProfile(userId, { departmentId: null });
}

export function markAttendance(params: {
	classSessionId: number;
	studentProfileId: number;
	status: string;
	markedByProfessorProfileId: number | null;
}): Promise<CommandResult<AttendanceRecord>> {
	return withPrismaResult(() =>
		prisma.attendanceRecord.upsert({
			where: {
				classSessionId_studentProfileId: {
					classSessionId: params.classSessionId,
					studentProfileId: params.studentProfileId,
				},
			},
			create: params,
			update: {
				status: params.status,
				markedByProfessorProfileId: params.markedByProfessorProfileId,
			},
		}),
	);
}

export function createAcademicPeriod(
	params: import('../../ports/commands').CreateAcademicPeriodParams,
): Promise<CommandResult<AcademicPeriod>> {
	return withPrismaResult(() => prisma.academicPeriod.create({ data: params }));
}

export function createClassOffering(
	params: import('../../ports/commands').CreateClassOfferingParams,
): Promise<CommandResult<ClassOffering>> {
	return withPrismaResult(() => prisma.classOffering.create({ data: params }));
}

export const commandsRepository: AcademicCommandsRepository = {
	insertStudentProfile,
	createProfessorProfile: insertProfessorProfile,
	createStaffProfile: insertStaffProfile,
	updateStudentProfile,
	updateProfessorProfile,
	updateStaffProfile,
	linkStudentToCourse,
	linkProfessorToDepartment,
	unlinkStudentFromCourse,
	unlinkProfessorFromDepartment,
	markAttendance,
	createAcademicPeriod,
	createClassOffering,
};

export const queriesRepository: AcademicQueriesRepository = {
	selectStudentProfileByUserId,
	selectProfessorProfileByUserId,
	selectStaffProfileByUserId,
};
