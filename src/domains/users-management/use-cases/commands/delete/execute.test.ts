import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Delete User', () => {
	it('deletes a user as an admin', async () => {
		const scenario = makeUsersScenario().withUser();
		scenario.mocks.commandsRepository.deleteUser.mockResolvedValue({
			ok: true,
			data: scenario.mocks.queriesRepository.selectUserById.mock.results[0]
				?.value ?? { id: 1 },
		});

		await expect(scenario.executeDeleteUser()).resolves.toMatchObject({
			id: 1,
		});

		expect(scenario.mocks.commandsRepository.deleteUser).toHaveBeenCalledWith(
			1,
		);
	});

	it('blocks non-privileged users from deleting another user', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeDeleteUser({ clientRole: 'student' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws NotFoundError when the target user does not exist', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.deleteUser.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'User not found',
		});

		await expect(scenario.executeDeleteUser()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
