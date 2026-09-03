import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type {
	AcademicActivity,
	AcademicActivitySubmission,
} from '../../ports/models';
import type { ActivitiesCommandsRepository } from '../../ports/commands';

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
					allowLateSubmissions: params.allowLateSubmissions ?? true,
					createdByProfessorProfileId:
						params.createdByProfessorProfileId ?? null,
				},
			});

			return activity;
		}),
	);
}

export function createAcademicActivitySubmission(
	params: import('../../ports/commands').CreateAcademicActivitySubmissionParams,
): Promise<CommandResult<AcademicActivitySubmission>> {
	return prisma.academicActivity
		.findUnique({
			where: { id: params.activityId },
			select: { dueAt: true, allowLateSubmissions: true },
		})
		.then((activity) => {
			if (
				activity?.dueAt &&
				!activity.allowLateSubmissions &&
				activity.dueAt.getTime() < (params.submittedAt ?? new Date()).getTime()
			) {
				return {
					ok: false as const,
					data: null,
					code: 'FORBIDDEN' as const,
					message: 'This activity does not accept late submissions',
				};
			}
			return withPrismaResult(async () => {
				const submission = await prisma.$transaction(async (tx) => {
					const created = await tx.academicActivitySubmission.create({
						data: {
							activityId: params.activityId,
							studentProfileId: params.studentProfileId,
							submittedAt: params.submittedAt ?? new Date(),
							attachments: params.attachments?.length
								? {
										create: params.attachments.map((attachment) => ({
											...attachment,
											fileKey:
												attachment.fileKey ??
												new URL(attachment.fileUrl).pathname.replace(
													/^\/+/,
													'',
												),
										})),
									}
								: undefined,
						},
						include: { attachments: true },
					});
					return created;
				});
				return { ...submission, grade: submission.grade?.toString() ?? null };
			});
		});
}

export const commandsRepository: ActivitiesCommandsRepository = {
	createAcademicActivity,
	createAcademicActivitySubmission,
	selectAcademicActivitiesByClassOfferingId,
	selectAcademicActivitySubmissionsByStudentProfileId,
};

export function selectAcademicActivitiesByClassOfferingId(
	classOfferingId: number,
) {
	return prisma.academicActivity.findMany({
		where: { classOfferingId },
		orderBy: [{ dueAt: 'asc' }, { id: 'asc' }],
	});
}

export function selectAcademicActivitySubmissionsByStudentProfileId(
	studentProfileId: number,
) {
	return prisma.academicActivitySubmission
		.findMany({
			where: { studentProfileId },
			orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
			include: { attachments: true },
		})
		.then((submissions) =>
			submissions.map((submission) => ({
				...submission,
				grade: submission.grade?.toString() ?? null,
				attachments: submission.attachments,
			})),
		);
}

export const queriesRepository = {};
