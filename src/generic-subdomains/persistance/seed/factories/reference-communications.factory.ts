import type { SeedDb } from '../config';
import { referenceAnnouncements } from '../catalogs/reference-announcements';
import { referenceCohort } from '../catalogs/reference-cohort';

export async function seedReferenceCommunications(
	db: SeedDb,
	academicPeriodId: number,
	createdByUserId: number,
) {
	for (const item of referenceAnnouncements) {
		const data = {
			title: `[DEV-AGIAS-REFERENCE] ${item.title}`,
			body: item.body,
			audience: item.audience,
			isPinned: item.isPinned,
			publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
			expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
			createdByUserId,
		};
		const current = await db.announcement.findFirst({
			where: { title: data.title, createdByUserId },
		});
		if (current)
			await db.announcement.update({ where: { id: current.id }, data });
		else await db.announcement.create({ data });
	}
	for (const date of referenceCohort.excludedDates) {
		await seedReferenceEvent(db, {
			academicPeriodId,
			createdByUserId,
			date,
			title: `Dia sem aulas — ${date}`,
			type: 'holiday',
			endDate: date,
		});
	}
	await seedReferenceEvent(db, {
		academicPeriodId,
		createdByUserId,
		date: '2026-09-19',
		title: 'Sábado de reposição',
		type: 'instructional_saturday',
		endDate: '2026-09-19',
	});
	await seedReferenceEvent(db, {
		academicPeriodId,
		createdByUserId,
		date: '2026-12-07',
		title: 'Mostra de projetos de Informática',
		type: 'academic_event',
		endDate: '2026-12-11',
	});
}

async function seedReferenceEvent(
	db: SeedDb,
	input: {
		academicPeriodId: number;
		createdByUserId: number;
		date: string;
		endDate: string;
		title: string;
		type: 'holiday' | 'instructional_saturday' | 'academic_event';
	},
) {
	const { date, endDate, ...fields } = input;
	const data = {
		...fields,
		title: `[DEV-AGIAS-REFERENCE] ${input.title}`,
		startsAt: new Date(`${date}T00:00:00-03:00`),
		endsAt: new Date(`${endDate}T23:59:59-03:00`),
		allDay: true,
		isInstructionalDay: input.type !== 'holiday',
	};
	// Reuse an existing institutional holiday, regardless of its display title.
	const holiday =
		input.type === 'holiday'
			? await db.academicCalendarEvent.findFirst({
					where: {
						academicPeriodId: input.academicPeriodId,
						type: 'holiday',
						startsAt: {
							gte: new Date(`${date}T00:00:00Z`),
							lt: new Date(`${endDate}T23:59:59Z`),
						},
					},
				})
			: null;
	if (holiday && holiday.title !== data.title) return;
	const current = await db.academicCalendarEvent.findFirst({
		where: {
			academicPeriodId: input.academicPeriodId,
			title: data.title,
			createdByUserId: input.createdByUserId,
		},
	});
	if (current)
		await db.academicCalendarEvent.update({ where: { id: current.id }, data });
	else await db.academicCalendarEvent.create({ data });
}
