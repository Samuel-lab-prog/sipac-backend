const nodeEnv = process.env.NODE_ENV ?? 'development';

if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL =
		nodeEnv === 'test'
			? 'postgresql://postgres:postgres@localhost:5432/sipac_test'
			: 'postgresql://postgres:postgres@localhost:5432/sipac_dev';
}

if (!process.env.JWT_SECRET_KEY) {
	process.env.JWT_SECRET_KEY = 'local-dev-secret';
}
