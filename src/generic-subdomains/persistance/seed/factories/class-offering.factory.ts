import { SEED_PREFIX, type ScenarioName, type SeedDb } from '../config';

export async function seedOffering(
	db: SeedDb,
	input: {
		scenario: ScenarioName;
		term: number;
		code: string;
		title: string;
		courseId: number;
		academicPeriodId: number;
		studentProfileId: number;
		professorProfileId?: number;
	},
) {
	const {
		scenario,
		term,
		code,
		title,
		courseId,
		academicPeriodId,
		studentProfileId,
		professorProfileId,
	} = input;
	const offeringCode = `${SEED_PREFIX}${scenario.toUpperCase()}-${term}-${code}`;
	const data = {
		title,
		courseId,
		academicPeriodId,
		shift: 'morning' as const,
		year: 2026,
		term: String(term),
	};
	const offering = await db.classOffering.upsert({
		where: { code: offeringCode },
		update: data,
		create: { ...data, code: offeringCode },
	});
	await db.enrollment.upsert({
		where: {
			studentProfileId_classOfferingId: {
				studentProfileId,
				classOfferingId: offering.id,
			},
		},
		update: { status: term === 1 ? 'completed' : 'active' },
		create: {
			studentProfileId,
			classOfferingId: offering.id,
			status: term === 1 ? 'completed' : 'active',
		},
	});
	if (professorProfileId)
		await db.teachingAssignment.upsert({
			where: {
				professorProfileId_classOfferingId: {
					professorProfileId,
					classOfferingId: offering.id,
				},
			},
			update: {},
			create: { professorProfileId, classOfferingId: offering.id },
		});
	return offering;
}
