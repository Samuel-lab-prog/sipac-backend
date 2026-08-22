import { describe, expect, it } from 'bun:test';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnknownError,
} from '@DomainError';
import { DEFAULT_USER_ID, makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Update User', () => {
	it('updates a user as an admin', async () => {
		const scenario = makeUsersScenario().withUser();

		scenario.mocks.commandsRepository.updateUser.mockResolvedValue({
			ok: true,
			data: {
				id: DEFAULT_USER_ID,
				name: 'Novo Nome',
				nickname: 'novo',
				email: 'novo@exemplo.com',
				rg: '7654321',
				cpf: '10987654321',
				role: 'student',
				status: 'active',
				avatarUrl: null,
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				updatedAt: new Date('2026-01-02T00:00:00.000Z'),
				deletedAt: null,
				emailVerifiedAt: null,
			},
		});

		await expect(
			scenario.executeUpdateUser({
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
			name: 'Novo Nome',
		});

		expect(scenario.mocks.commandsRepository.updateUser).toHaveBeenCalledWith(
			DEFAULT_USER_ID,
			expect.objectContaining({
				name: 'Novo Nome',
				nickname: 'novo',
				email: 'novo@exemplo.com',
				rg: '7654321',
				cpf: '10987654321',
				avatarUrl: null,
			}),
		);
	});

	it('blocks non-admin users from updating another user', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeUpdateUser({ clientRole: 'student' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws NotFoundError when the target user does not exist', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateUser.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'User not found',
		});

		await expect(scenario.executeUpdateUser()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});

	it('throws ConflictError when the repository reports a duplicate', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateUser.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'User already exists',
		});

		await expect(scenario.executeUpdateUser()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.updateUser.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeUpdateUser()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
