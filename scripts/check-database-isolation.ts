import { existsSync, readFileSync } from 'node:fs';
import {
	databaseIdentityKey,
	describeDatabaseUrl,
	getDatabaseSafetyError,
} from '../src/server-config/utils/databaseSafety';

type EnvFileTarget = {
	file: string;
	nodeEnv: 'development' | 'test';
};

const TARGETS: EnvFileTarget[] = [
	{ file: '.env.development', nodeEnv: 'development' },
	{ file: '.env.test', nodeEnv: 'test' },
];

function readEnvValue(file: string, name: string): string | undefined {
	const content = readFileSync(file, 'utf8');
	const line = content
		.split(/\r?\n/)
		.find((entry) => entry.trim().match(new RegExp(`^${name}\\s*=`)));

	if (!line) return undefined;

	return line
		.replace(new RegExp(`^\\s*${name}\\s*=\\s*`), '')
		.trim()
		.replace(/^['"]|['"]$/g, '');
}

const identities = new Map<string, EnvFileTarget>();

for (const target of TARGETS) {
	if (!existsSync(target.file))
		throw new Error(
			`${target.file} is required for database isolation checks.`,
		);

	const databaseUrl = readEnvValue(target.file, 'DATABASE_URL');
	const safetyError = getDatabaseSafetyError({
		databaseUrl,
		nodeEnv: target.nodeEnv,
	});

	if (safetyError) throw new Error(`${target.file}: ${safetyError}`);

	const identityKey = databaseIdentityKey(databaseUrl!);
	if (!identityKey)
		throw new Error(`${target.file}: DATABASE_URL must be a valid URL.`);

	const previous = identities.get(identityKey);
	if (previous) {
		throw new Error(
			`${target.file} points to the same database as ${previous.file}. Dev and test databases must be separate.`,
		);
	}

	identities.set(identityKey, target);
	console.log(`${target.file}: ${describeDatabaseUrl(databaseUrl!)}`);
}

console.log('Database isolation check passed.');
