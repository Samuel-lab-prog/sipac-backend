import { beforeEach, describe, expect, it, mock } from 'bun:test';

const executeRawUnsafeMock = mock((_query: string) =>
	Promise.resolve(undefined),
);

mock.module('@Prisma/PrismaClient', () => ({
	prisma: {
		$executeRawUnsafe: executeRawUnsafeMock,
	},
}));

const { applicationTables, clearDatabase } = await import('./ClearDatabase');

const expectedApplicationTables = [
	'_PoemMentions',
	'_PoemToTag',
	'BlockedUser',
	'Collection',
	'CollectionItem',
	'Comment',
	'CommentLike',
	'Friendship',
	'FriendshipRequest',
	'Notification',
	'Poem',
	'PoemDedication',
	'PoemLike',
	'SavedPoem',
	'Tag',
	'User',
	'UserMention',
	'UserNotificationSetting',
	'UserSanction',
] as const;

describe('clearDatabase', () => {
	beforeEach(() => {
		executeRawUnsafeMock.mockClear();
		executeRawUnsafeMock.mockImplementation(() => Promise.resolve(undefined));
	});

	it('executes truncate statement once', async () => {
		await clearDatabase();

		expect(executeRawUnsafeMock).toHaveBeenCalledTimes(1);
	});

	it('truncates every application table and restarts identity', async () => {
		await clearDatabase();

		const [query] = executeRawUnsafeMock.mock.calls[0] ?? [];
		const sql = String(query);

		expect(sql).toContain('TRUNCATE TABLE');
		expect(applicationTables).toEqual(expectedApplicationTables);
		for (const table of expectedApplicationTables) {
			expect(sql).toContain(`"${table}"`);
		}
		expect(sql).not.toContain('"_prisma_migrations"');
		expect(sql).toContain('RESTART IDENTITY CASCADE');
	});

	it('retries transient deadlocks before succeeding', async () => {
		let attempts = 0;
		executeRawUnsafeMock.mockImplementation(() => {
			attempts++;
			if (attempts === 1)
				return Promise.reject(
					Object.assign(
						new Error(
							'Raw query failed. Code: `40P01`. Message: `impasse detectado`',
						),
						{ code: 'P2010' },
					),
				);
			return Promise.resolve(undefined);
		});

		await clearDatabase();

		expect(executeRawUnsafeMock).toHaveBeenCalledTimes(2);
	});

	it('does not retry non-deadlock failures', async () => {
		const error = Object.assign(new Error('permission denied'), {
			code: 'P2010',
		});
		executeRawUnsafeMock.mockImplementation(() => Promise.reject(error));

		await expect(clearDatabase()).rejects.toThrow('permission denied');

		expect(executeRawUnsafeMock).toHaveBeenCalledTimes(1);
	});
});
