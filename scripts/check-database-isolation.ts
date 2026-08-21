import './load-local-env';
import { databaseIdentityKey } from '../src/server-config/utils/databaseSafety';

const devDatabaseUrl =
	'postgresql://postgres:postgres@localhost:5432/sipac_dev';
const testDatabaseUrl =
	'postgresql://postgres:postgres@localhost:5432/sipac_test';

const devKey = databaseIdentityKey(devDatabaseUrl);
const testKey = databaseIdentityKey(testDatabaseUrl);

if (!devKey || !testKey || devKey === testKey) {
	console.error('Database isolation check failed.');
	process.exit(1);
}

console.log('Database isolation check passed.');
