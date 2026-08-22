import { describe, expect, it } from 'bun:test';
import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Update Current User', () => {
	it('updates the current user', async () => {
		const scenario = makeUsersScenario().withUser();

		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				name: 'Novo Nome',
				nickname: 'novo',
				email: 'novo@exemplo.com',
				rg: '7654321',
				cpf: '10987654321',
				role: 'admin',
				status: 'active',
				avatarUrl: null,
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				updatedAt: new Date('2026-01-02T00:00:00.000Z'),
				deletedAt: null,
				emailVerifiedAt: null,
			},
		});

		await expect(
			scenario.executeUpdateCurrentUser({
				data: {
					name: 'Novo Nome',
					nickname: 'novo',
					email: 'novo@exemplo.com',
					rg: '7654321',
					cpf: '10987654321',
					avatarUrl: null,
				},
			}),
		).resolves.toMatchObject({
			email: 'novo@exemplo.com',
		});
	});

	it('blocks inactive users from updating themselves', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeUpdateCurrentUser({ clientStatus: 'suspended' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws ConflictError when the repository reports a duplicate', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'User already exists',
		});

		await expect(scenario.executeUpdateCurrentUser()).rejects.toBeInstanceOf(
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

		await expect(scenario.executeUpdateCurrentUser()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
