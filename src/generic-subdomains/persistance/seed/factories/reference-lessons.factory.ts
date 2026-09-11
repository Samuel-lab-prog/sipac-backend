import type { Prisma } from '../../prisma/generated/client';
import type { SeedDb } from '../config';
import type { ReferenceSubject } from '../catalogs/reference-subjects';
import type { LessonBlueprint } from '../utils/reference-blueprint';
import type { SeedPerson } from './reference-people.factory';

type ReferenceTopic = { id: number; unitId: number; title: string };

export async function seedReferenceLessons(
	db: SeedDb,
	input: {
		classOfferingId: number;
		subject: ReferenceSubject;
		topics: ReferenceTopic[];
		lessons: LessonBlueprint[];
	},
) {
	const existing = await db.classSession.findMany({
		where: { classOfferingId: input.classOfferingId },
	});
	const byDate = new Map(
		existing.map((lesson) => [lesson.startsAt.getTime(), lesson]),
	);
	const sessions = [];
	for (const lesson of input.lessons) {
		const topic = input.topics[lesson.topicIndex]!;
		const replacesSessionId =
			lesson.replacesIndex === undefined
				? null
				: (sessions[lesson.replacesIndex]?.id ?? null);
		const data: Prisma.ClassSessionUncheckedCreateInput = {
			classOfferingId: input.classOfferingId,
			coursePlanTopicId: topic.id,
			startsAt: lesson.startsAt,
			endsAt: lesson.endsAt,
			status: lesson.status,
			topic: topic.title,
			room: input.subject.room,
			publicNotes: lesson.publicNotes,
			deliveredContent:
				lesson.status === 'completed'
					? `Conceitos e exemplos de ${topic.title.toLowerCase()}. Exercícios discutidos e síntese registrada pela turma.`
					: null,
			replacesSessionId,
		};
		const current = byDate.get(lesson.startsAt.getTime());
		const session: Awaited<ReturnType<SeedDb['classSession']['create']>> =
			current
				? await db.classSession.update({ where: { id: current.id }, data })
				: await db.classSession.create({ data });
		sessions.push(session);
		await db.classSessionMaterial.upsert({
			where: {
				classSessionId_url: {
					classSessionId: session.id,
					url: input.subject.resource.url,
				},
			},
			update: { title: input.subject.resource.title },
			create: { classSessionId: session.id, ...input.subject.resource },
		});
	}
	return sessions;
}

export async function seedReferenceAttendance(
	db: SeedDb,
	input: {
		sessions: Array<{ id: number; status: string }>;
		students: SeedPerson[];
		professorProfileId: number;
		subjectIndex: number;
	},
) {
	const records = input.sessions.flatMap((session, sessionIndex) =>
		session.status === 'completed'
			? input.students.map((student) => ({
					classSessionId: session.id,
					studentProfileId: student.profileId,
					status:
						(student.index + sessionIndex + input.subjectIndex) % 11 === 0
							? 'absent'
							: 'present',
					markedByProfessorProfileId: input.professorProfileId,
				}))
			: [],
	);
	await db.attendanceRecord.createMany({ data: records, skipDuplicates: true });
	// Two grouped updates make reruns deterministic without deleting historical rows.
	for (const status of ['present', 'absent']) {
		const targets = records.filter((record) => record.status === status);
		if (targets.length)
			await db.attendanceRecord.updateMany({
				where: {
					OR: targets.map(({ classSessionId, studentProfileId }) => ({
						classSessionId,
						studentProfileId,
					})),
				},
				data: { status, markedByProfessorProfileId: input.professorProfileId },
			});
	}
}
