import { describe, expect, it } from 'bun:test';
import { makeUsersScenario } from '../../test-helpers';

describe('users-management > getCurrentUser', () => {
	it('returns the current user', async () => {
		const scenario = makeUsersScenario().withUser();

		await expect(scenario.executeGetCurrentUser()).resolves.toMatchObject({
			id: 1,
			email: 'teste@exemplo.com',
		});
	});
});
