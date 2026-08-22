import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type { ClassSession } from '../../ports/models';
import type {
	ScheduleCommandsRepository,
	UpdateClassSessionParams,
} from '../../ports/commands';

export function createClassSession(
	params: import('../../ports/commands').CreateClassSessionParams,
): Promise<CommandResult<ClassSession>> {
	return withPrismaResult(() =>
		prisma.$transaction(async (tx) => {
			const conflict = await tx.classSession.findFirst({
				where: {
					classOfferingId: params.classOfferingId,
					startsAt: params.startsAt,
				},
			});

			if (conflict) {
				throw new Error('Class session already exists at this start time');
			}

			return tx.classSession.create({
				data: {
					classOfferingId: params.classOfferingId,
					startsAt: params.startsAt,
					endsAt: params.endsAt ?? null,
					topic: params.topic ?? null,
				},
			});
		}),
	);
}

export function updateClassSession(
	params: UpdateClassSessionParams,
): Promise<CommandResult<ClassSession>> {
	return withPrismaResult(() =>
		prisma.classSession.update({
			where: { id: params.classSessionId },
			data: {
				startsAt: params.startsAt,
				endsAt: params.endsAt,
				topic: params.topic,
			},
		}),
	);
}

export function deleteClassSession(classSessionId: number) {
	return withPrismaResult(() =>
		prisma.classSession.delete({
			where: { id: classSessionId },
		}),
	);
}

export function selectClassSessionById(classSessionId: number) {
	return prisma.classSession.findUnique({
		where: { id: classSessionId },
	});
}

export function selectClassSessionsByClassOfferingId(classOfferingId: number) {
	return prisma.classSession.findMany({
		where: { classOfferingId },
		orderBy: { startsAt: 'asc' },
	});
}

export const commandsRepository: ScheduleCommandsRepository = {
	createClassSession,
	updateClassSession,
	deleteClassSession,
	selectClassSessionById,
	selectClassSessionsByClassOfferingId,
};

export const queriesRepository = {};
