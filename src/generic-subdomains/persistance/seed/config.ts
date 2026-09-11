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
	'reference',
] as const;
export type ScenarioName = (typeof SCENARIOS)[number];

export function assertSeedEnvironment() {
	const nodeEnv = process.env.NODE_ENV ?? 'development';
	if (!['development', 'test'].includes(nodeEnv))
		throw new Error('Student seeds are restricted to development and test.');
	assertDatabaseSafety({ databaseUrl: process.env.DATABASE_URL, nodeEnv });
}

export function parseSeedArgs(args: string[]) {
	let scenario = 'all';
	let scenarioSeen = false;
	for (let index = 0; index < args.length; index++) {
		const arg = args[index]!;
		if (arg === '--') continue;
		if (arg === '--scenario' || arg.startsWith('--scenario=')) {
			if (scenarioSeen) throw new Error('Specify --scenario only once.');
			scenarioSeen = true;
			scenario = arg === '--scenario' ? (args[++index] ?? '') : arg.slice(11);
		} else if (!['--clean', '--dry-run', '--list'].includes(arg)) {
			throw new Error(`Unknown seed argument: ${arg}`);
		}
	}
	if (scenario !== 'all' && !SCENARIOS.includes(scenario as ScenarioName))
		throw new Error(`Use --scenario=all|${SCENARIOS.join('|')}`);
	if (args.includes('--clean') && args.includes('--dry-run'))
		throw new Error('Use --clean or --dry-run, not both.');
	return {
		scenarios: scenario === 'all' ? [...SCENARIOS] : [scenario as ScenarioName],
		clean: args.includes('--clean'),
		dryRun: args.includes('--dry-run'),
		list: args.includes('--list'),
	};
}
