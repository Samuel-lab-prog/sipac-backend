import type { PrismaClient } from '../prisma/generated/client';
import { BcryptHashService } from '../../../shared-kernel/infra/encrypting/bcrypt';
import {
	assertSeedEnvironment,
	parseSeedArgs,
	SEED_PASSWORD,
	SEED_PREFIX,
} from './config';
import { seedCourse } from './factories/course.factory';
import { seedProfessor } from './factories/user.factory';
import { seedPeriod, seedEvents } from './factories/academic-period.factory';
import { seedScenario } from './scenarios/student.scenarios';

export async function runStudentSeeds(prisma: PrismaClient, args: string[]) {
	assertSeedEnvironment();
	const options = parseSeedArgs(args);
	const passwordHash = await BcryptHashService.hash(SEED_PASSWORD);
	return prisma.$transaction(
		async (db) => {
			if (options.clean) {
				for (const scenario of options.scenarios) {
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
				}
				return { cleaned: options.scenarios };
			}
			const { department, course } = await seedCourse(db);
			const professor = await seedProfessor(db, department.id, passwordHash);
			if (
				options.scenarios.some(
					(name) => name === 'complete' || name === 'semester',
				)
			) {
				const period = await seedPeriod(db, 2);
				await seedEvents(db, period.id, professor.userId);
			}
			const accounts = [];
			for (const scenario of options.scenarios)
				accounts.push(
					await seedScenario(
						db,
						scenario,
						course.id,
						professor.id,
						passwordHash,
					),
				);
			return { accounts, password: SEED_PASSWORD, referenceDate: '2026-09-10' };
		},
		{ timeout: 60_000 },
	);
}
