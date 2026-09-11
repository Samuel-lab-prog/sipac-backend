import { REFERENCE_DATE, type SeedDb } from '../config';
import { weeklyDates } from '../utils/dates';

export async function seedLessons(
	db: SeedDb,
	classOfferingId: number,
	topics: Array<{ id: number; title: string }>,
	options: { term: number; incomplete: boolean; weekdayOffset: number },
) {
	const { term, incomplete, weekdayOffset } = options;
	const start = new Date(
		term === 1 ? '2026-03-02T08:00:00-03:00' : '2026-08-17T08:00:00-03:00',
	);
	start.setUTCDate(start.getUTCDate() + weekdayOffset);
	const dates = weeklyDates(
		start.toISOString(),
		term === 1 ? '2026-06-29T23:59:59-03:00' : '2026-11-30T23:59:59-03:00',
		['2026-09-07', '2026-11-02'],
	);
	const sessions = [];
	for (const [index, startsAt] of dates.entries()) {
		const topic = incomplete
			? undefined
			: topics[Math.min(Math.floor(index / 3), topics.length - 1)];
		const status =
			index === 4
				? ('cancelled' as const)
				: startsAt < REFERENCE_DATE
					? ('completed' as const)
					: ('scheduled' as const);
		const data = {
			classOfferingId,
			startsAt,
			endsAt: new Date(startsAt.getTime() + 100 * 60_000),
			topic: topic?.title ?? null,
			coursePlanTopicId: topic?.id ?? null,
			status,
			deliveredContent: status === 'completed' ? (topic?.title ?? null) : null,
			room: incomplete ? null : 'Laboratório 02',
			publicNotes:
				status === 'cancelled'
					? 'Aula cancelada. Consulte a reposição na agenda.'
					: null,
		};
		const existing = await db.classSession.findFirst({
			where: { classOfferingId, startsAt },
		});
		sessions.push(
			existing
				? await db.classSession.update({ where: { id: existing.id }, data })
				: await db.classSession.create({ data }),
		);
	}
	const cancelled = sessions.find((session) => session.status === 'cancelled');
	if (cancelled) sessions.push(await seedReplacement(db, cancelled));
	if (!incomplete && sessions[0]) await seedLessonMaterial(db, sessions[0].id);
	return sessions;
}

function seedReplacement(
	db: SeedDb,
	cancelled: {
		id: number;
		classOfferingId: number;
		startsAt: Date;
		topic: string | null;
		coursePlanTopicId: number | null;
	},
) {
	const startsAt = new Date(
		cancelled.startsAt.getTime() + 5 * 24 * 60 * 60_000,
	);
	const data = {
		classOfferingId: cancelled.classOfferingId,
		startsAt,
		endsAt: new Date(startsAt.getTime() + 100 * 60_000),
		topic: cancelled.topic,
		coursePlanTopicId: cancelled.coursePlanTopicId,
		status:
			startsAt < REFERENCE_DATE
				? ('completed' as const)
				: ('scheduled' as const),
		deliveredContent: startsAt < REFERENCE_DATE ? cancelled.topic : null,
		room: 'Laboratório 03',
		publicNotes: 'Reposição da aula cancelada.',
	};
	return db.classSession.upsert({
		where: { replacesSessionId: cancelled.id },
		update: data,
		create: { ...data, replacesSessionId: cancelled.id },
	});
}

function seedLessonMaterial(db: SeedDb, classSessionId: number) {
	return db.classSessionMaterial.upsert({
		where: {
			classSessionId_url: {
				classSessionId,
				url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development',
			},
		},
		update: { title: 'Guia de estudo: desenvolvimento web' },
		create: {
			classSessionId,
			title: 'Guia de estudo: desenvolvimento web',
			url: 'https://developer.mozilla.org/pt-BR/docs/Learn_web_development',
		},
	});
}
