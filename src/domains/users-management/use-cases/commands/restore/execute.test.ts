import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Restore User', () => {
	it('restores a deleted user', async () => {
		const scenario = makeUsersScenario().withUser();
		scenario.mocks.commandsRepository.restoreUser.mockResolvedValue({
			ok: true,
			data: scenario.mocks.queriesRepository.selectUserById.mock.results[0]
				?.value ?? { id: 1 },
		});

		await expect(scenario.executeRestoreUser()).resolves.toMatchObject({
			id: 1,
		});
	});

	it('blocks non-privileged users from restoring another user', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeRestoreUser({ clientRole: 'student' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws NotFoundError when the target user does not exist', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.restoreUser.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'User not found',
		});

		await expect(scenario.executeRestoreUser()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
