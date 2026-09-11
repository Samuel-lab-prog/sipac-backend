import type { SeedDb } from '../config';

export async function seedPlan(
	db: SeedDb,
	classOfferingId: number,
	titles: readonly string[],
	draft = false,
) {
	const data = {
		syllabus: 'Fundamentos, prática orientada e projeto aplicado.',
		generalObjectives:
			'Aplicar os conceitos em situações reais e desenvolver autonomia.',
		methodology: 'Aulas dialogadas, laboratório e projetos.',
		assessmentCriteria: 'Atividades, prova e projeto com devolutiva.',
		workloadMinutes: 3600,
		status: draft ? ('draft' as const) : ('published' as const),
	};
	const plan = await db.coursePlan.upsert({
		where: { classOfferingId },
		update: data,
		create: { ...data, classOfferingId },
	});
	const topics = [];
	for (let position = 0; position < titles.length; position++) {
		const unitPosition = Math.floor(position / 3) + 1;
		const title = unitPosition === 1 ? 'Fundamentos' : 'Aplicação e projeto';
		const unit = await db.coursePlanUnit.upsert({
			where: {
				coursePlanId_position: {
					coursePlanId: plan.id,
					position: unitPosition,
				},
			},
			update: { title },
			create: { title, coursePlanId: plan.id, position: unitPosition },
		});
		const topicData = {
			title: titles[position]!,
			type: position === 5 ? ('assessment' as const) : ('content' as const),
			estimatedMinutes: 100,
		};
		topics.push(
			await db.coursePlanTopic.upsert({
				where: {
					unitId_position: { unitId: unit.id, position: (position % 3) + 1 },
				},
				update: topicData,
				create: { ...topicData, unitId: unit.id, position: (position % 3) + 1 },
			}),
		);
	}
	return topics;
}
