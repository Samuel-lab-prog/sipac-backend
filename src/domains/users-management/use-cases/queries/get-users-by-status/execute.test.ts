import { describe, expect, it } from 'bun:test';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Get Users By Status', () => {
	it('returns paginated users filtered by status', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await expect(
			scenario.executeGetUsersByStatus({ status: 'active' }),
		).resolves.toMatchObject({
			hasMore: false,
			users: [{ id: 1, email: 'teste@exemplo.com' }],
		});

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			status: 'active',
			limit: 20,
			cursor: undefined,
		});
	});
});
