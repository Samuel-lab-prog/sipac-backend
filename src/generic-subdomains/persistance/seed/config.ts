import { assertDatabaseSafety } from '../../../server-config/utils/databaseSafety';
import type { Prisma } from '../prisma/generated/client';

export type SeedDb = Prisma.TransactionClient;
export const SEED_PREFIX = 'DEV-AGIAS-';
export const SEED_PASSWORD = 'student-demo-2026';
export const REFERENCE_DATE = new Date('2026-09-10T12:00:00-03:00');
export const SCENARIOS = [
	'complete',
	'empty',
	'semester',
	'exceptions',
] as const;
export type ScenarioName = (typeof SCENARIOS)[number];

export function assertSeedEnvironment() {
	const nodeEnv = process.env.NODE_ENV ?? 'development';
	if (!['development', 'test'].includes(nodeEnv))
		throw new Error('Student seeds are restricted to development and test.');
	assertDatabaseSafety({ databaseUrl: process.env.DATABASE_URL, nodeEnv });
}

export function parseSeedArgs(args: string[]) {
	const scenarioArg = args.find((arg) => arg.startsWith('--scenario='));
	const scenario = scenarioArg?.split('=')[1] ?? 'all';
	if (scenario !== 'all' && !SCENARIOS.includes(scenario as ScenarioName))
		throw new Error('Use --scenario=all|complete|empty|semester|exceptions');
	return {
		scenarios: scenario === 'all' ? [...SCENARIOS] : [scenario as ScenarioName],
		clean: args.includes('--clean'),
	};
}
