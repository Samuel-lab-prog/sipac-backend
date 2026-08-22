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

export const commandsRepository: ActivitiesCommandsRepository = {
	createAcademicActivity,
	createAcademicActivitySubmission,
};

export const queriesRepository = {};
