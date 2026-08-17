type RuntimeEnvironment = 'development' | 'test' | 'production' | string;

type DatabaseIdentity = {
	host: string;
	port: string;
	database: string;
	schema: string;
};

const DEFAULT_POSTGRES_PORT = '5432';
const DEFAULT_POSTGRES_SCHEMA = 'public';

function normalizeRuntimeEnvironment(
	nodeEnv: string | undefined,
): RuntimeEnvironment {
	if (!nodeEnv || nodeEnv === 'dev') return 'development';
	return nodeEnv;
}

export function parseDatabaseIdentity(
	databaseUrl: string,
): DatabaseIdentity | null {
	try {
		const url = new URL(databaseUrl);
		return {
			host: url.hostname,
			port: url.port || DEFAULT_POSTGRES_PORT,
			database: url.pathname.replace(/^\//, ''),
			schema: url.searchParams.get('schema') || DEFAULT_POSTGRES_SCHEMA,
		};
	} catch {
		return null;
	}
}

export function databaseIdentityKey(databaseUrl: string): string | null {
	const identity = parseDatabaseIdentity(databaseUrl);
	if (!identity) return null;

	return [
		identity.host.toLowerCase(),
		identity.port,
		identity.database.toLowerCase(),
		identity.schema.toLowerCase(),
	].join('|');
}

export function describeDatabaseUrl(databaseUrl: string): string {
	const identity = parseDatabaseIdentity(databaseUrl);
	if (!identity) return '(invalid DATABASE_URL)';

	return [
		`host=${identity.host}`,
		`port=${identity.port}`,
		`db=${identity.database || '(missing)'}`,
		`schema=${identity.schema}`,
	].join(' ');
}

function hasAnyMarker(value: string, markers: string[]): boolean {
	return markers.some((marker) => value.includes(marker));
}

export function getDatabaseSafetyError(params: {
	databaseUrl: string | undefined;
	nodeEnv: string | undefined;
}): string | null {
	const { databaseUrl } = params;
	const nodeEnv = normalizeRuntimeEnvironment(params.nodeEnv);

	if (!databaseUrl || databaseUrl.trim().length === 0)
		return 'DATABASE_URL is required.';

	const identity = parseDatabaseIdentity(databaseUrl);
	if (!identity) return 'DATABASE_URL must be a valid URL.';

	const target = `${identity.database}_${identity.schema}`.toLowerCase();

	if (nodeEnv === 'test') {
		if (!hasAnyMarker(target, ['test']))
			return 'NODE_ENV=test must use a database/schema name containing "test".';

		if (hasAnyMarker(target, ['dev', 'development', 'prod', 'production']))
			return 'NODE_ENV=test cannot use a dev or production database/schema.';
	}

	if (nodeEnv === 'development') {
		if (!hasAnyMarker(target, ['dev', 'development']))
			return 'NODE_ENV=development must use a database/schema name containing "dev" or "development".';

		if (hasAnyMarker(target, ['test', 'prod', 'production']))
			return 'NODE_ENV=development cannot use a test or production database/schema.';
	}

	if (
		nodeEnv === 'production' &&
		hasAnyMarker(target, ['test', 'dev', 'development'])
	) {
		return 'NODE_ENV=production cannot use a dev or test database/schema.';
	}

	return null;
}

export function assertDatabaseSafety(params: {
	databaseUrl: string | undefined;
	nodeEnv: string | undefined;
}): asserts params is { databaseUrl: string; nodeEnv: string | undefined } {
	const error = getDatabaseSafetyError(params);
	if (error) throw new Error(error);
}
