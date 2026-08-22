import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type { AcademicPeriod, ClassOffering } from '../../ports/models';

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

export const commandsRepository = {
	createAcademicPeriod,
	createClassOffering,
};
