import type { PrismaClient } from '../prisma/generated/client';
import { BcryptHashService } from '../../../shared-kernel/infra/encrypting/bcrypt';
import {
	assertSeedEnvironment,
	parseSeedArgs,
	SEED_PASSWORD,
	SCENARIOS,
} from './config';
import { seedCourse } from './factories/course.factory';
import { seedProfessor } from './factories/user.factory';
import { seedPeriod, seedEvents } from './factories/academic-period.factory';
import { seedScenario } from './scenarios/student.scenarios';
import { seedReferenceScenario } from './scenarios/reference.scenario';
import {
	referencePreview,
	validateReferenceCatalog,
} from './utils/reference-blueprint';
import { cleanSeedScenarios } from './cleanup';
import { seedReport } from './report';
import { seedInstitution } from './factories/institution.factory';
import { seedReferenceServices } from './factories/reference-services.factory';

export async function runStudentSeeds(prisma: PrismaClient, args: string[]) {
	assertSeedEnvironment();
	const options = parseSeedArgs(args);
	if (options.list) return { scenarios: SCENARIOS, default: 'all' };
	if (options.scenarios.includes('reference')) validateReferenceCatalog();
	if (options.dryRun)
		return {
			dryRun: true,
			scenarios: options.scenarios,
			reference: options.scenarios.includes('reference')
				? referencePreview()
				: undefined,
		};
	const passwordHash = await BcryptHashService.hash(SEED_PASSWORD);
	return prisma.$transaction(
		async (db) => {
			if (options.clean) return cleanSeedScenarios(db, options.scenarios);
			await seedInstitution(db);
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
			for (const scenario of options.scenarios) {
				if (scenario === 'reference') {
					const reference = await seedReferenceScenario(
						db,
						course.id,
						passwordHash,
					);
					await seedReferenceServices(db, reference, passwordHash);
					accounts.push(reference);
					continue;
				}
				accounts.push(
					await seedScenario(
						db,
						scenario,
						course.id,
						professor.id,
						passwordHash,
					),
				);
			}
			return {
				accounts,
				password: SEED_PASSWORD,
				referenceDate: '2026-09-10',
				counts: await seedReport(db, options.scenarios),
			};
		},
		{ timeout: 120_000 },
	);
}
