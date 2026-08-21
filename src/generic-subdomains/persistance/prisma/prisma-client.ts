import { log } from '@GenericSubdomains/utils/logging/logger';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrl } from 'server-config/config';
import 'server-config/utils/envBootstrap';
import { PrismaClient } from './generated/client';

const connectionString = getDatabaseUrl();

try {
	const url = new URL(connectionString);
	log.info(
		{
			dbHost: url.hostname,
			dbPort: url.port || '5432',
			dbName: url.pathname.replace('/', ''),
			sslmode: url.searchParams.get('sslmode'),
			hasUser: !!url.username,
			hasPassword: !!url.password,
		},
		'Prisma database config (sanitized)',
	);
} catch (error) {
	log.warn(
		{ error },
		'Failed to parse DATABASE_URL for logging (using raw connection string)',
	);
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
	adapter,
	errorFormat: 'pretty',
	log: [
		{ emit: 'event', level: 'error' },
		{ emit: 'event', level: 'warn' },
	],
});

prisma.$on('error', (event) => {
	log.error(
		{
			message: event.message,
			target: event.target,
			timestamp: event.timestamp,
		},
		'Prisma client error',
	);
});

prisma.$on('warn', (event) => {
	log.warn(
		{
			message: event.message,
			target: event.target,
			timestamp: event.timestamp,
		},
		'Prisma client warning',
	);
});
