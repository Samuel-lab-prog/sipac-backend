import type { SeedDb } from '../config';
import type { ReferenceSubject } from '../catalogs/reference-subjects';
import { referenceActivities } from '../catalogs/reference-activities';
import type { SeedPerson } from './reference-people.factory';
import { seedReferenceSubmissions } from './reference-submissions.factory';

export async function seedReferenceActivities(
	db: SeedDb,
	input: {
		classOfferingId: number;
		subject: ReferenceSubject;
		subjectIndex: number;
		students: SeedPerson[];
		professor: SeedPerson;
		topics: Array<{ id: number; unitId: number }>;
		sessions: Array<{
			id: number;
			startsAt: Date;
			status: string;
			coursePlanTopicId: number | null;
		}>;
	},
) {
	for (const blueprint of referenceActivities(input.subject)) {
		const ordered = [...input.sessions].sort(
			(a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
		);
		const scheduled = ordered.filter(
			(session) =>
				!['cancelled', 'rescheduled', 'missed'].includes(session.status),
		);
		const session =
			blueprint.sessionIndex === -1
				? scheduled.at(-1)!
				: scheduled[blueprint.sessionIndex]!;
		const topic = input.topics.find(
			(topic) => topic.id === session.coursePlanTopicId,
		)!;
		const assessment = blueprint.kind === 'assessment';
		const appliesAt = assessment ? session.startsAt : null;
		const data = {
			classOfferingId: input.classOfferingId,
			title: blueprint.title,
			description: `Atividade de demonstração de ${input.subject.title}. Consulte o material de apoio, apresente seu raciocínio e revise o trabalho com base nos critérios do planejamento.`,
			kind: blueprint.kind,
			dueAt: blueprint.dueAt ? new Date(blueprint.dueAt) : null,
			allowLateSubmissions: blueprint.allowLateSubmissions,
			appliesAt,
			assessmentType: assessment
				? blueprint.key === 'final'
					? 'Projeto e apresentação'
					: 'Avaliação escrita'
				: null,
			maxGrade: 10,
			weight: assessment ? (blueprint.key === 'final' ? 3 : 2) : 1,
			createdByProfessorProfileId: input.professor.profileId,
			coursePlanUnitId: topic.unitId,
			coursePlanTopicId: topic.id,
			classSessionId: session.id,
			createdAt: new Date('2026-08-03T07:00:00-03:00'),
		};
		const current = await db.academicActivity.findFirst({
			where: { classOfferingId: input.classOfferingId, title: blueprint.title },
		});
		const activity = current
			? await db.academicActivity.update({ where: { id: current.id }, data })
			: await db.academicActivity.create({ data });
		await seedReferenceAttachment(
			db,
			activity.id,
			input.subject,
			blueprint.key,
		);
		await seedReferenceSubmissions(db, {
			activityId: activity.id,
			blueprint,
			students: input.students,
			subjectIndex: input.subjectIndex,
			appliesAt,
			professorUserId: input.professor.userId,
		});
	}
}

async function seedReferenceAttachment(
	db: SeedDb,
	activityId: number,
	subject: ReferenceSubject,
	key: string,
) {
	const fileKey = `dev-agias/reference/${subject.code}/${key}/resource`;
	const data = {
		activityId,
		fileKey,
		fileName: subject.resource.title,
		fileUrl: subject.resource.url,
	};
	const current = await db.academicActivityAttachment.findFirst({
		where: { activityId, fileKey },
	});
	if (current)
		await db.academicActivityAttachment.update({
			where: { id: current.id },
			data,
		});
	else await db.academicActivityAttachment.create({ data });
}
