import { prisma } from '@Prisma';
import type {
	AcademicCalendarQueriesRepository,
	AcademicCalendarListParams,
	StudentAcademicCalendarParams,
} from '../../ports/queries';

const eventSelect = {
	id: true,
	academicPeriodId: true,
	type: true,
	title: true,
	description: true,
	startsAt: true,
	endsAt: true,
	allDay: true,
	isInstructionalDay: true,
} as const;

export function listEvents({
	academicPeriodId,
	from,
	to,
}: AcademicCalendarListParams) {
	return prisma.academicCalendarEvent.findMany({
		where: {
			...(academicPeriodId ? { academicPeriodId } : {}),
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
		select: eventSelect,
	});
}

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
					where: { status: { in: ['active', 'completed'] } },
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
								AND: [
									...(to ? [{ startsAt: { lt: to } }] : []),
									...(from
										? [
												{
													OR: [
														{ endsAt: { gte: from } },
														{ endsAt: null, startsAt: { gte: from } },
													],
												},
											]
										: []),
								],
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
	listEvents,
};
