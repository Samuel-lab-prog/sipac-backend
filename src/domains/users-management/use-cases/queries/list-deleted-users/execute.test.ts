import { describe, expect, it } from 'bun:test';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > List Deleted Users', () => {
	it('returns deleted users with pagination', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await expect(scenario.executeListDeletedUsers()).resolves.toMatchObject({
			hasMore: false,
			users: [{ id: 1, email: 'teste@exemplo.com' }],
		});

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			deleted: true,
			limit: 20,
			cursor: undefined,
		});
	});
});
