import type { SeedDb } from '../config';
import type { ReferenceSubject } from '../catalogs/reference-subjects';
import { referenceCohort } from '../catalogs/reference-cohort';
import type { LessonBlueprint } from '../utils/reference-blueprint';

export async function seedReferencePlan(
	db: SeedDb,
	classOfferingId: number,
	subject: ReferenceSubject,
	lessons: LessonBlueprint[],
) {
	const planned = lessons.filter(
		(lesson) => !['cancelled', 'rescheduled'].includes(lesson.status),
	);
	const data = {
		syllabus: `${subject.units.join('; ')}. ${subject.topics.join('; ')}.`,
		generalObjectives: `Desenvolver autonomia em ${subject.title} e produzir: ${subject.project.toLowerCase()}.`,
		methodology:
			'Estudo orientado, discussão em grupo, oficinas e projeto com acompanhamento por etapas.',
		assessmentCriteria:
			'Critérios: compreensão dos conceitos (40%), aplicação e autoria (40%), comunicação e revisão (20%).',
		workloadMinutes: planned.length * referenceCohort.lessonMinutes,
		status: 'published' as const,
	};
	const plan = await db.coursePlan.upsert({
		where: { classOfferingId },
		update: data,
		create: { ...data, classOfferingId },
	});
	const topics = [];
	for (const [position, title] of subject.units.entries()) {
		const unitLessons = planned.filter(
			(lesson) => Math.floor(lesson.topicIndex / 3) === position,
		);
		const dates = unitLessons
			.map((lesson) => lesson.startsAt.getTime())
			.sort((a, b) => a - b);
		const unitData = {
			title,
			description: `Percurso de estudo: ${title.toLowerCase()}.`,
			startsAt: new Date(dates[0]!),
			endsAt: new Date(dates.at(-1)! + 100 * 60_000),
			workloadMinutes: unitLessons.length * 100,
		};
		const unit = await db.coursePlanUnit.upsert({
			where: {
				coursePlanId_position: {
					coursePlanId: plan.id,
					position: position + 1,
				},
			},
			update: unitData,
			create: { ...unitData, coursePlanId: plan.id, position: position + 1 },
		});
		for (let offset = 0; offset < 3; offset++) {
			const topicIndex = position * 3 + offset;
			const topicData = {
				title: subject.topics[topicIndex]!,
				description: `Estudo e prática de ${subject.topics[topicIndex]!.toLowerCase()}.`,
				type: topicIndex === 5 ? ('project' as const) : ('content' as const),
				estimatedMinutes:
					planned.filter((lesson) => lesson.topicIndex === topicIndex).length *
					100,
			};
			topics.push(
				await db.coursePlanTopic.upsert({
					where: { unitId_position: { unitId: unit.id, position: offset + 1 } },
					update: topicData,
					create: { ...topicData, unitId: unit.id, position: offset + 1 },
				}),
			);
		}
	}
	return topics;
}
