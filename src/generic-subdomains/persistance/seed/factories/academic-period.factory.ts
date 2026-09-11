import type { SeedDb } from '../config';
import { academicEvents } from '../catalogs/academic-events';

/** Existing institution periods are reused without editing their dates or events. */
export function seedPeriod(db: SeedDb, term: number) {
	return db.academicPeriod.upsert({
		where: { year_term: { year: 2026, term } },
		update: {},
		create: {
			year: 2026,
			term,
			code: `2026.${term}`,
			startsAt: new Date(
				term === 1 ? '2026-02-02T00:00:00-03:00' : '2026-08-03T00:00:00-03:00',
			),
			endsAt: new Date(
				term === 1 ? '2026-07-17T23:59:59-03:00' : '2026-12-18T23:59:59-03:00',
			),
		},
	});
}

export async function seedEvents(
	db: SeedDb,
	academicPeriodId: number,
	createdByUserId: number,
) {
	for (const item of academicEvents) {
		const data = {
			...item,
			title: `[DEV-AGIAS] ${item.title}`,
			startsAt: new Date(item.startsAt),
			endsAt: new Date(item.endsAt),
			academicPeriodId,
			createdByUserId,
			allDay: true,
		};
		const existing = await db.academicCalendarEvent.findFirst({
			where: { academicPeriodId, title: data.title, createdByUserId },
		});
		const dayStart = new Date(`${item.startsAt.slice(0, 10)}T00:00:00Z`);
		const institutionEvent = await db.academicCalendarEvent.findFirst({
			where: {
				academicPeriodId,
				title: item.title,
				startsAt: {
					gte: dayStart,
					lt: new Date(dayStart.getTime() + 24 * 60 * 60_000),
				},
			},
		});
		if (institutionEvent) {
			if (existing)
				await db.academicCalendarEvent.delete({ where: { id: existing.id } });
			continue;
		}
		if (existing)
			await db.academicCalendarEvent.update({
				where: { id: existing.id },
				data,
			});
		else await db.academicCalendarEvent.create({ data });
	}
}
