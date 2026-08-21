import { afterEach, describe, expect, it, mock } from 'bun:test';

const ORIGINAL_EXECUTE_RAW_UNSAFE = process.env.__CLEAR_DATABASE_TEST__;

async function loadClearDatabaseModule(options?: { failures?: Array<Error> }) {
	const executeRawUnsafe = mock(async () => {
		const nextFailure = options?.failures?.shift();
		if (nextFailure) throw nextFailure;
		return 1;
	});

	await mock.module('@Prisma/prisma-client', () => ({
		prisma: {
			$executeRawUnsafe: executeRawUnsafe,
		},
	}));

	return {
		...(await import(
			`./clear-database.ts?test=${Date.now()}-${Math.random()}`
		)),
		mocks: { executeRawUnsafe },
	};
}

afterEach(() => {
	mock.restore();
	if (ORIGINAL_EXECUTE_RAW_UNSAFE === undefined)
		delete process.env.__CLEAR_DATABASE_TEST__;
	else process.env.__CLEAR_DATABASE_TEST__ = ORIGINAL_EXECUTE_RAW_UNSAFE;
});

describe('UNIT - Generic Subdomains Persistance', () => {
	describe('clear-database', () => {
		it('truncates the configured tables', async () => {
			const { clearDatabase, mocks } = await loadClearDatabaseModule();

			await clearDatabase();

			expect(mocks.executeRawUnsafe).toHaveBeenCalledTimes(1);
			expect(mocks.executeRawUnsafe).toHaveBeenCalledWith(
				expect.stringContaining('TRUNCATE TABLE'),
			);
			expect(mocks.executeRawUnsafe.mock.calls[0]?.[0]).toContain('"User"');
		});

		it('retries deadlock errors before succeeding', async () => {
			const { clearDatabase, mocks } = await loadClearDatabaseModule({
				failures: [new Error('deadlock detected'), new Error('40P01')],
			});

			await clearDatabase();

			expect(mocks.executeRawUnsafe).toHaveBeenCalledTimes(3);
		});

		it('rethrows non-deadlock errors immediately', async () => {
			const { clearDatabase, mocks } = await loadClearDatabaseModule({
				failures: [new Error('permission denied')],
			});

			await expect(clearDatabase()).rejects.toThrow('permission denied');
			expect(mocks.executeRawUnsafe).toHaveBeenCalledTimes(1);
		});
	});
});
