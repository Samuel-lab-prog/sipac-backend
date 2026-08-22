import { prisma } from '@Prisma';
import { withPrismaErrorHandling, withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type {
	AcademicActivity,
	AcademicActivitySubmission,
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

export function createAcademicActivity(
	params: import('../../ports/commands').CreateAcademicActivityParams,
): Promise<CommandResult<AcademicActivity>> {
	return withPrismaResult(() =>
		prisma.$transaction(async (tx) => {
			const activity = await tx.academicActivity.create({
				data: {
					classOfferingId: params.classOfferingId,
					title: params.title,
					description: params.description ?? null,
					dueAt: params.dueAt ?? null,
					createdByProfessorProfileId:
						params.createdByProfessorProfileId ?? null,
				},
			});

			if (params.attachments?.length) {
				await tx.academicActivityAttachment.createMany({
					data: params.attachments.map((attachment) => ({
						activityId: activity.id,
						fileName: attachment.fileName,
						fileUrl: attachment.fileUrl,
						fileKey: attachment.fileKey,
						contentType: attachment.contentType ?? null,
						fileSize: attachment.fileSize ?? null,
					})),
				});
			}

			return activity;
		}),
	);
}

export function createAcademicActivitySubmission(
	params: import('../../ports/commands').CreateAcademicActivitySubmissionParams,
): Promise<CommandResult<AcademicActivitySubmission>> {
	return withPrismaResult(async () => {
		const submission = await prisma.academicActivitySubmission.create({
			data: {
				activityId: params.activityId,
				studentProfileId: params.studentProfileId,
				submittedAt: params.submittedAt ?? new Date(),
			},
		});

		return {
			...submission,
			grade: submission.grade?.toString() ?? null,
		};
	});
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
	createAcademicActivity,
	createAcademicActivitySubmission,
};

export const queriesRepository: AcademicQueriesRepository = {
	selectStudentProfileByUserId,
	selectProfessorProfileByUserId,
	selectStaffProfileByUserId,
};
