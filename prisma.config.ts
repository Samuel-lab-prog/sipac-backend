import { defineConfig } from 'prisma/config';
import './src/server-config/utils/loadEnv';
import { assertDatabaseSafety } from './src/server-config/utils/databaseSafety';

if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL =
		process.env.NODE_ENV === 'test'
			? 'postgresql://postgres:postgres@localhost:5432/sipac_test'
			: 'postgresql://postgres:postgres@localhost:5432/sipac_dev';
}

assertDatabaseSafety({
	databaseUrl: process.env.DATABASE_URL,
	nodeEnv: process.env.NODE_ENV,
});

export default defineConfig({
	schema: 'src/generic-subdomains/persistance/prisma/schema.prisma',

	migrations: {
		path: 'src/generic-subdomains/persistance/prisma/migrations',
	},

	datasource: {
		url: process.env.DATABASE_URL,
	},
});
