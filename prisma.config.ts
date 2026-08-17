import { defineConfig } from 'prisma/config';
import './src/server-config/utils/loadEnv';
import { assertDatabaseSafety } from './src/server-config/utils/databaseSafety';

assertDatabaseSafety({
	databaseUrl: process.env.DATABASE_URL,
	nodeEnv: process.env.NODE_ENV,
});

export default defineConfig({
	schema: 'src/generic-subdomains/persistance/prisma/schema.prisma',

	migrations: {
		path: 'src/generic-subdomains/persistance/prisma/migrations',
		seed: 'bun src/generic-subdomains/persistance/prisma/seeds/main.ts',
	},

	datasource: {
		url: process.env.DATABASE_URL,
	},
});
