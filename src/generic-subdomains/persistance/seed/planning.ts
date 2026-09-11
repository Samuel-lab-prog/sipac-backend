import type { PrismaClient } from '../prisma/generated/client';

type SeedOffering = { id: number; title: string };

const plans = [
	{
		title: 'Fundamentos e prática',
		syllabus: 'Conceitos fundamentais, prática orientada e projeto aplicado.',
		units: [
			['Fundamentos', ['Apresentação e combinados', 'Conceitos essenciais', 'Exercícios guiados']],
			['Aplicação', ['Prática em laboratório', 'Projeto orientado', 'Revisão e avaliação']],
		],
	},
	{
		title: 'Leitura e produção',
		syllabus: 'Leitura crítica, repertório e produção textual.',
		units: [
			['Leitura crítica', ['Contexto histórico', 'Leitura orientada', 'Debate']],
			['Produção', ['Estrutura textual', 'Oficina de escrita', 'Revisão']],
		],
	},
] as const;

/** Creates deterministic, idempotent read-only planning fixtures for student screens. */
export async function seedCoursePlans(prisma: PrismaClient, offerings: SeedOffering[]) {
	for (const [index, offering] of offerings.entries()) {
		const blueprint = plans[index % plans.length]!;
		const plan = await prisma.coursePlan.upsert({
			where: { classOfferingId: offering.id },
			update: { syllabus: blueprint.syllabus, status: 'published' },
			create: {
				classOfferingId: offering.id,
				syllabus: blueprint.syllabus,
				generalObjectives: `Desenvolver competências em ${offering.title}.`,
				methodology: 'Aulas expositivas, prática orientada e acompanhamento contínuo.',
				assessmentCriteria: 'Participação, atividades e avaliação do projeto.',
				workloadMinutes: 3600,
				status: 'published',
			},
		});
		const topicIds: number[] = [];

		for (const [unitPosition, [unitTitle, topicTitles]] of blueprint.units.entries()) {
			const unit = await prisma.coursePlanUnit.upsert({
				where: { coursePlanId_position: { coursePlanId: plan.id, position: unitPosition + 1 } },
				update: { title: unitTitle },
				create: { coursePlanId: plan.id, title: unitTitle, position: unitPosition + 1, workloadMinutes: 1800 },
			});
			for (const [topicPosition, topicTitle] of topicTitles.entries()) {
				await prisma.coursePlanTopic.upsert({
					where: { unitId_position: { unitId: unit.id, position: topicPosition + 1 } },
					update: { title: topicTitle },
					create: { unitId: unit.id, title: topicTitle, position: topicPosition + 1, estimatedMinutes: 600 },
				}).then((topic) => topicIds.push(topic.id));
			}
		}
		const sessions = await prisma.classSession.findMany({
			where: { classOfferingId: offering.id },
			orderBy: { startsAt: 'asc' },
			select: { id: true },
		});
		for (const [position, session] of sessions.entries()) {
			const topicId = topicIds[position];
			if (topicId) await prisma.classSession.update({ where: { id: session.id }, data: { coursePlanTopicId: topicId } });
		}
	}
}
