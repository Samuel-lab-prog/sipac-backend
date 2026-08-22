import { describe, expect, it } from 'bun:test';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Search Users', () => {
	it('searches users with pagination', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await expect(
			scenario.executeSearchUsers({ searchTerm: 'teste' }),
		).resolves.toMatchObject({
			hasMore: false,
			users: [{ id: 1, email: 'teste@exemplo.com' }],
		});

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			searchTerm: 'teste',
			limit: 20,
		});
	});

	it('caps the requested limit', async () => {
		const scenario = makeUsersScenario().withSelectedUsers();

		await scenario.executeSearchUsers({ searchTerm: 'teste', limit: 200 });

		expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith({
			searchTerm: 'teste',
			limit: 100,
		});
	});
});
