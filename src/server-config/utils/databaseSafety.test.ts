import { describe, expect, test } from 'bun:test';
import { databaseIdentityKey, getDatabaseSafetyError } from './databaseSafety';

describe('databaseSafety', () => {
	test('accepts isolated development and test database names', () => {
		expect(
			getDatabaseSafetyError({
				nodeEnv: 'development',
				databaseUrl:
					'postgresql://postgres:postgres@localhost:5432/hello_poetry_dev',
			}),
		).toBeNull();

		expect(
			getDatabaseSafetyError({
				nodeEnv: 'test',
				databaseUrl:
					'postgresql://postgres:postgres@localhost:5432/hello_poetry_test',
			}),
		).toBeNull();
	});

	test('rejects test runs pointing to a development database', () => {
		expect(
			getDatabaseSafetyError({
				nodeEnv: 'test',
				databaseUrl:
					'postgresql://postgres:postgres@localhost:5432/hello_poetry_dev',
			}),
		).toContain('NODE_ENV=test');
	});

	test('rejects development runs pointing to a test database', () => {
		expect(
			getDatabaseSafetyError({
				nodeEnv: 'development',
				databaseUrl:
					'postgresql://postgres:postgres@localhost:5432/hello_poetry_test',
			}),
		).toContain('NODE_ENV=development');
	});

	test('compares database identities without credentials', () => {
		expect(
			databaseIdentityKey(
				'postgresql://dev_user:dev_pass@localhost:5432/hello_poetry_dev',
			),
		).toBe(
			databaseIdentityKey(
				'postgresql://other_user:other_pass@localhost:5432/hello_poetry_dev',
			),
		);

		expect(
			databaseIdentityKey(
				'postgresql://postgres:postgres@localhost:5432/hello_poetry_dev',
			),
		).not.toBe(
			databaseIdentityKey(
				'postgresql://postgres:postgres@localhost:5432/hello_poetry_test',
			),
		);
	});
});
