import { SEED_PREFIX, type ScenarioName, type SeedDb } from './config';

/** Explicit deletion is restricted to owned scenario classes and fictional student identities. */
export async function cleanSeedScenarios(
	db: SeedDb,
	scenarios: ScenarioName[],
) {
	for (const scenario of scenarios) {
		await db.classOffering.deleteMany({
			where: {
				code: { startsWith: `${SEED_PREFIX}${scenario.toUpperCase()}-` },
				course: { code: `${SEED_PREFIX}CURSO` },
			},
		});
		await db.user.deleteMany({
			where: {
				email: `student.${scenario}@dev.agias.example`,
				nickname: `dev.agias.${scenario}`,
				studentProfile: { academicId: { startsWith: 'DEVAGIAS' } },
			},
		});
		if (scenario === 'reference') {
			await db.user.deleteMany({
				where: {
					email: {
						startsWith: 'student.reference.',
						endsWith: '@dev.agias.example',
					},
					nickname: { startsWith: 'dev.agias.reference.' },
					studentProfile: { academicId: { startsWith: 'DEVAGIASREF2026' } },
				},
			});
			await db.announcement.deleteMany({
				where: {
					title: { startsWith: '[DEV-AGIAS-REFERENCE]' },
					createdBy: { email: 'staff.reference@dev.agias.example' },
				},
			});
			await db.academicCalendarEvent.deleteMany({
				where: {
					title: { startsWith: '[DEV-AGIAS-REFERENCE]' },
					createdBy: { email: 'staff.reference@dev.agias.example' },
				},
			});
		}
	}
	return {
		cleaned: scenarios,
		preserved:
			'Institutional periods, courses, departments, faculty, management accounts and unrelated data.',
	};
}
