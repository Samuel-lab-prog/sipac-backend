import type { SeedDb } from '../config';

export async function seedActivities(
	db: SeedDb,
	input: {
		classOfferingId: number;
		studentProfileId: number;
		topic?: { id: number; unitId: number };
		classSessionId?: number;
		incomplete: boolean;
		term: number;
	},
) {
	const {
		classOfferingId,
		studentProfileId,
		topic,
		classSessionId,
		incomplete,
		term,
	} = input;
	const items = [
		{
			title: 'Exercícios de fixação',
			kind: 'activity' as const,
			dueAt:
				term === 1 ? '2026-04-10T23:59:00-03:00' : '2026-09-08T23:59:00-03:00',
		},
		{
			title: 'Projeto aplicado',
			kind: 'activity' as const,
			dueAt:
				term === 1 ? '2026-06-15T23:59:00-03:00' : '2026-09-18T23:59:00-03:00',
		},
		{ title: 'Avaliação parcial', kind: 'assessment' as const, dueAt: null },
	];
	for (const [index, item] of items.entries()) {
		const data = {
			title: item.title,
			kind: item.kind,
			classOfferingId,
			description: incomplete
				? null
				: 'Aplicação dos conceitos trabalhados em aula.',
			dueAt: item.dueAt ? new Date(item.dueAt) : null,
			appliesAt:
				item.kind === 'assessment'
					? new Date(
							term === 1
								? '2026-06-18T08:00:00-03:00'
								: '2026-09-16T08:00:00-03:00',
						)
					: null,
			assessmentType: item.kind === 'assessment' ? 'Prova' : null,
			maxGrade: item.kind === 'assessment' ? 10 : null,
			weight: item.kind === 'assessment' ? 2 : null,
			coursePlanTopicId: topic?.id ?? null,
			coursePlanUnitId: topic?.unitId ?? null,
			classSessionId: classSessionId ?? null,
		};
		const existing = await db.academicActivity.findFirst({
			where: { classOfferingId, title: item.title },
		});
		const activity = existing
			? await db.academicActivity.update({ where: { id: existing.id }, data })
			: await db.academicActivity.create({ data });
		if (!incomplete && index === 1) await seedActivityMaterial(db, activity.id);
		if (term === 1 && !incomplete)
			await seedGrade(db, activity.id, studentProfileId);
	}
}

async function seedActivityMaterial(db: SeedDb, activityId: number) {
	const fileKey = 'dev-agias/project-guide';
	const attachment = await db.academicActivityAttachment.findFirst({
		where: { activityId, fileKey },
	});
	const file = {
		activityId,
		fileKey,
		fileName: 'Referência para o projeto',
		fileUrl: 'https://developer.mozilla.org/pt-BR/docs/Web/HTML',
	};
	if (attachment)
		await db.academicActivityAttachment.update({
			where: { id: attachment.id },
			data: file,
		});
	else await db.academicActivityAttachment.create({ data: file });
}

function seedGrade(db: SeedDb, activityId: number, studentProfileId: number) {
	return db.academicActivitySubmission.upsert({
		where: {
			activityId_studentProfileId: {
				activityId,
				studentProfileId,
			},
		},
		update: { grade: '8.50' },
		create: {
			activityId,
			studentProfileId,
			grade: '8.50',
			submittedAt: new Date('2026-06-18T09:00:00-03:00'),
		},
	});
}
