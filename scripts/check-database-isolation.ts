import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { databaseIdentityKey } from '../src/server-config/utils/databaseSafety';

function loadEnvFile(fileName: string): Record<string, string> {
	const envPath = resolve(process.cwd(), fileName);
	if (!existsSync(envPath)) {
		throw new Error(`Missing required env file: ${fileName}`);
	}

	return config({ path: envPath }).parsed ?? {};
}

const developmentEnv = loadEnvFile('.env.development');
const testEnv = loadEnvFile('.env.test');

const developmentDatabaseUrl = developmentEnv.DATABASE_URL;
const testDatabaseUrl = testEnv.DATABASE_URL;

const developmentKey = developmentDatabaseUrl
	? databaseIdentityKey(developmentDatabaseUrl)
	: null;
const testKey = testDatabaseUrl ? databaseIdentityKey(testDatabaseUrl) : null;

if (!developmentKey || !testKey || developmentKey === testKey) {
	console.error('Database isolation check failed.');
	process.exit(1);
}

console.log('Database isolation check passed.');
