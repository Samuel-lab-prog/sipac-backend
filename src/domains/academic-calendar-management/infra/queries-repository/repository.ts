import { prisma } from '@Prisma';
import type {
	AcademicCalendarQueriesRepository,
	StudentAcademicCalendarParams,
} from '../../ports/queries';

export function listEventsForStudent({
	userId,
	from,
	to,
}: StudentAcademicCalendarParams) {
	return prisma.studentProfile
		.findUnique({
			where: { userId },
			select: {
				enrollments: {
					where: { status: 'active' },
					select: { classOffering: { select: { academicPeriodId: true } } },
				},
			},
		})
		.then((profile) => {
			const periodIds = [
				...new Set(
					profile?.enrollments.map(
						(item) => item.classOffering.academicPeriodId,
					) ?? [],
				),
			];
			if (periodIds.length === 0) return [];
			return prisma.academicCalendarEvent.findMany({
				where: {
					academicPeriodId: { in: periodIds },
					...(from || to
						? {
								startsAt: {
									...(from ? { gte: from } : {}),
									...(to ? { lt: to } : {}),
								},
							}
						: {}),
				},
				orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
				select: {
					id: true,
					academicPeriodId: true,
					type: true,
					title: true,
					description: true,
					startsAt: true,
					endsAt: true,
					allDay: true,
					isInstructionalDay: true,
				},
			});
		});
}

export const queriesRepository: AcademicCalendarQueriesRepository = {
	listEventsForStudent,
};
