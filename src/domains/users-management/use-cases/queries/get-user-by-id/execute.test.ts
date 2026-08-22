import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Get User By Id', () => {
	it('returns a user by id', async () => {
		const scenario = makeUsersScenario().withUser();

		await expect(scenario.executeGetUserById()).resolves.toMatchObject({
			id: 1,
			email: 'teste@exemplo.com',
		});
	});

	it('blocks unauthorized access to another user', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeGetUserById({ clientRole: 'student' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws NotFoundError when the user does not exist', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.queriesRepository.selectUserById.mockResolvedValue(null);

		await expect(scenario.executeGetUserById()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
