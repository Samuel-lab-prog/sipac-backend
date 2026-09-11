import { prisma } from '@Prisma';
import { UnprocessableEntityError } from '@DomainError';
import { normalizeClassFields } from '../staff-writes';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type { AcademicPeriod, ClassOffering } from '../../ports/models';

export function createAcademicPeriod(
	params: import('../../ports/commands').CreateAcademicPeriodParams,
): Promise<CommandResult<AcademicPeriod>> {
	return withPrismaResult(() => prisma.academicPeriod.create({ data: params }));
}

export async function createClassOffering(
	params: import('../../ports/commands').CreateClassOfferingParams,
): Promise<CommandResult<ClassOffering>> {
	const [period, course] = await Promise.all([
		prisma.academicPeriod.findUnique({
			where: { id: params.academicPeriodId },
		}),
		prisma.course.findUnique({
			where: { id: params.courseId },
			select: { id: true },
		}),
	]);
	if (!period || !course)
		throw new UnprocessableEntityError(
			'Selecione um curso e um período letivo existentes.',
		);
	const fields = normalizeClassFields(params);
	return withPrismaResult(() =>
		prisma.classOffering.create({
			data: {
				...params,
				...fields,
				year: period.year,
				term: String(period.term),
			},
		}),
	);
}

export const commandsRepository = {
	createAcademicPeriod,
	createClassOffering,
};
