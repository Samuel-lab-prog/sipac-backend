import { prisma } from '@Prisma';
import { ConflictError, UnprocessableEntityError } from '@DomainError';
import type { Static } from 'elysia';
import { requireClass, requireLesson, requireActivity } from './access';
import type * as schema from './schemas';

export async function savePlan(
	professorId: number,
	classId: number,
	body: Static<typeof schema.planBody>,
) {
	await requireClass(professorId, classId);
	if (body.status === 'published' && !body.syllabus?.trim())
		throw new UnprocessableEntityError(
			'Preencha a ementa antes de publicar o plano.',
		);
	await prisma.coursePlan.upsert({
		where: { classOfferingId: classId },
		create: { ...body, classOfferingId: classId },
		update: body,
	});
	return { success: true };
}
export async function addUnit(
	professorId: number,
	classId: number,
	body: Static<typeof schema.unitBody>,
) {
	await requireClass(professorId, classId);
	try {
		await prisma.$transaction(async (tx) => {
			const plan = await tx.coursePlan.upsert({
				where: { classOfferingId: classId },
				create: { classOfferingId: classId },
				update: {},
			});
			const last = await tx.coursePlanUnit.aggregate({
				where: { coursePlanId: plan.id },
				_max: { position: true },
			});
			await tx.coursePlanUnit.create({
				data: {
					coursePlanId: plan.id,
					title: body.title.trim(),
					position: (last._max.position ?? 0) + 1,
					topics: {
						create: body.topics.map((title, index) => ({
							title: title.trim(),
							position: index + 1,
						})),
					},
				},
			});
		});
	} catch (error) {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			error.code === 'P2002'
		)
			throw new ConflictError(
				'O plano foi atualizado por outro professor. Atualize a página e tente novamente.',
			);
		throw error;
	}
	return { success: true };
}
export async function saveLesson(
	professorId: number,
	classId: number,
	body: Static<typeof schema.lessonBody>,
	lessonId?: number,
) {
	await requireClass(professorId, classId);
	if (lessonId) {
		const lesson = await requireLesson(professorId, lessonId);
		if (lesson.classOfferingId !== classId)
			throw new UnprocessableEntityError('A aula pertence a outra turma.');
	}
	if (body.endsAt && Date.parse(body.endsAt) <= Date.parse(body.startsAt))
		throw new UnprocessableEntityError(
			'O término deve ser posterior ao início da aula.',
		);
	if (
		body.coursePlanTopicId &&
		!(await prisma.coursePlanTopic.count({
			where: {
				id: body.coursePlanTopicId,
				unit: { coursePlan: { classOfferingId: classId } },
			},
		}))
	)
		throw new UnprocessableEntityError(
			'O tópico deve pertencer ao plano desta turma.',
		);
	const data = {
		...body,
		topic: body.topic.trim(),
		startsAt: new Date(body.startsAt),
		endsAt: body.endsAt ? new Date(body.endsAt) : null,
	};
	const row = lessonId
		? await prisma.classSession.update({ where: { id: lessonId }, data })
		: await prisma.classSession.create({
				data: { ...data, classOfferingId: classId },
			});
	return { id: row.id };
}
export async function addMaterial(
	professorId: number,
	lessonId: number,
	body: Static<typeof schema.materialBody>,
) {
	await requireLesson(professorId, lessonId);
	const url = new URL(body.url);
	if (!['http:', 'https:'].includes(url.protocol))
		throw new UnprocessableEntityError('Use um link HTTP ou HTTPS.');
	await prisma.classSessionMaterial.upsert({
		where: { classSessionId_url: { classSessionId: lessonId, url: body.url } },
		create: { ...body, classSessionId: lessonId },
		update: { title: body.title },
	});
	return { success: true };
}
export async function saveActivity(
	professorId: number,
	classId: number,
	body: Static<typeof schema.activityBody>,
	activityId?: number,
) {
	await requireClass(professorId, classId);
	if (activityId) {
		const activity = await requireActivity(professorId, activityId);
		if (activity.classOfferingId !== classId)
			throw new UnprocessableEntityError('A atividade pertence a outra turma.');
		const highest = await prisma.academicActivitySubmission.aggregate({
			where: { activityId },
			_max: { grade: true },
		});
		if (
			highest._max.grade !== null &&
			(body.maxGrade === null || Number(highest._max.grade) > body.maxGrade)
		)
			throw new UnprocessableEntityError(
				'A nota máxima deve comportar as notas já lançadas.',
			);
	}
	if (body.kind === 'assessment' && (!body.appliesAt || body.maxGrade === null))
		throw new UnprocessableEntityError(
			'Informe a data de aplicação e a nota máxima da avaliação.',
		);
	const data = {
		...body,
		title: body.title.trim(),
		dueAt: body.dueAt ? new Date(body.dueAt) : null,
		appliesAt: body.appliesAt ? new Date(body.appliesAt) : null,
	};
	const row = activityId
		? await prisma.academicActivity.update({ where: { id: activityId }, data })
		: await prisma.academicActivity.create({
				data: {
					...data,
					classOfferingId: classId,
					createdByProfessorProfileId: professorId,
				},
			});
	return { id: row.id };
}
