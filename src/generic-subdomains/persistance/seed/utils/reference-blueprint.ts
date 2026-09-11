import { REFERENCE_DATE } from '../config';
import { referenceCohort } from '../catalogs/reference-cohort';
import {
	referenceSubjects,
	type ReferenceSubject,
} from '../catalogs/reference-subjects';
import { weeklyDates } from './dates';

export type LessonBlueprint = {
	startsAt: Date;
	endsAt: Date;
	status: 'completed' | 'scheduled' | 'cancelled' | 'rescheduled' | 'missed';
	topicIndex: number;
	replacesIndex?: number;
	publicNotes: string | null;
};

export function buildReferenceLessons(subjectIndex: number): LessonBlueprint[] {
	const weekday = Math.floor(subjectIndex / referenceCohort.times.length);
	const time =
		referenceCohort.times[subjectIndex % referenceCohort.times.length]!;
	const first = new Date(`${referenceCohort.firstMonday}T${time}:00-03:00`);
	first.setUTCDate(first.getUTCDate() + weekday);
	const dates = weeklyDates(
		first.toISOString(),
		`${referenceCohort.lastDay}T23:59:59-03:00`,
		[...referenceCohort.excludedDates],
	);
	const sessions: LessonBlueprint[] = dates.map((startsAt, index) => ({
		startsAt,
		endsAt: new Date(
			startsAt.getTime() + referenceCohort.lessonMinutes * 60_000,
		),
		status: startsAt < REFERENCE_DATE ? 'completed' : 'scheduled',
		topicIndex: Math.min(5, Math.floor((index * 6) / dates.length)),
		publicNotes: null,
	}));
	// Three different exceptions across the cohort; never apply attendance to them.
	if (subjectIndex < 2) {
		const original = sessions[3]!;
		original.status = subjectIndex === 0 ? 'cancelled' : 'rescheduled';
		original.publicNotes =
			'Encontro transferido para um sábado letivo. Veja a reposição.';
		const startsAt = new Date(
			`2026-09-19T${referenceCohort.times[subjectIndex]}:00-03:00`,
		);
		sessions.push({
			...original,
			startsAt,
			endsAt: new Date(startsAt.getTime() + 100 * 60_000),
			status: 'scheduled',
			replacesIndex: 3,
			publicNotes: 'Reposição do encontro de agosto.',
		});
	} else if (subjectIndex === 2) {
		sessions[2]!.status = 'missed';
		sessions[2]!.publicNotes =
			'Encontro não realizado; nova data ainda não definida.';
	}
	return sessions;
}

export function validateReferenceCatalog(
	subjects: readonly ReferenceSubject[] = referenceSubjects,
) {
	if (subjects.length !== 13)
		throw new Error('The reference class must contain 13 subjects.');
	if (new Set(subjects.map((item) => item.code)).size !== subjects.length)
		throw new Error('Reference subject codes must be unique.');
	const occupied: LessonBlueprint[] = [];
	for (const [index, subject] of subjects.entries()) {
		if (subject.topics.length !== 6 || new Set(subject.topics).size !== 6)
			throw new Error(`Invalid topics for ${subject.code}.`);
		for (const lesson of buildReferenceLessons(index)) {
			if (lesson.endsAt <= lesson.startsAt)
				throw new Error('Invalid lesson duration.');
			if (['cancelled', 'rescheduled', 'missed'].includes(lesson.status))
				continue;
			if (
				occupied.some(
					(other) =>
						lesson.startsAt < other.endsAt && lesson.endsAt > other.startsAt,
				)
			)
				throw new Error(`Overlapping reference lessons: ${subject.code}.`);
			occupied.push(lesson);
		}
	}
}

export function referencePreview() {
	validateReferenceCatalog();
	return referenceSubjects.map((subject, index) => ({
		code: `${referenceCohort.code}-${subject.code}`,
		title: subject.title,
		professor: subject.professor,
		weekday: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'][
			Math.floor(index / 3)
		],
		time: referenceCohort.times[index % 3],
		lessons: buildReferenceLessons(index).length,
	}));
}
