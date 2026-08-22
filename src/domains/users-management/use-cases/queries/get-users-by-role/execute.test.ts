import { describe, expect, it } from 'bun:test';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Get Users By Role', () => {
	it('returns paginated users filtered by role', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await expect(
			scenario.executeGetUsersByRole({ role: 'admin' }),
		).resolves.toMatchObject({
			hasMore: false,
			users: [{ id: 1, email: 'teste@exemplo.com' }],
		});

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			role: 'admin',
			limit: 20,
			cursor: undefined,
		});
	});

	it('caps the requested limit', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await scenario.executeGetUsersByRole({ role: 'admin', limit: 500 });

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			role: 'admin',
			limit: 100,
			cursor: undefined,
		});
	});
});
