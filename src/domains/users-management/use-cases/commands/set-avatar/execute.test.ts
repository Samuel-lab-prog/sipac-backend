import { describe, expect, it } from 'bun:test';
import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Set Avatar', () => {
	it('updates the current user avatar', async () => {
		const scenario = makeUsersScenario().withUser();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: true,
			data: {
				...scenario.mocks.queriesRepository.selectUserById.mock.results[0]
					?.value,
				avatarUrl: 'https://example.com/avatar.jpg',
			},
		});

		await expect(scenario.executeSetAvatar()).resolves.toMatchObject({
			avatarUrl: 'https://example.com/avatar.jpg',
		});
	});

	it('blocks inactive users from changing the avatar', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeSetAvatar({ clientStatus: 'blocked' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws ConflictError when the repository reports a duplicate', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'User already exists',
		});

		await expect(scenario.executeSetAvatar()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeSetAvatar()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
