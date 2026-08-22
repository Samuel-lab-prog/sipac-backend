import { describe, expect, it } from 'bun:test';
import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Change Password', () => {
	it('changes the current password after validating the old password', async () => {
		const scenario = makeUsersScenario().withUser().withCurrentPasswordHash();

		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				name: 'Teste Usuario',
				nickname: 'teste',
				email: 'teste@exemplo.com',
				rg: '1234567',
				cpf: '12345678901',
				role: 'admin',
				status: 'active',
				avatarUrl: null,
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				updatedAt: new Date('2026-01-01T00:00:00.000Z'),
				deletedAt: null,
				emailVerifiedAt: null,
			},
		});

		await expect(scenario.executeChangePassword()).resolves.toMatchObject({
			email: 'teste@exemplo.com',
		});

		expect(
			scenario.mocks.commandsRepository.getUserPasswordHashById,
		).toHaveBeenCalledWith(1);
		expect(
			scenario.mocks.commandsRepository.updateCurrentUser,
		).toHaveBeenCalledWith(
			1,
			expect.objectContaining({
				passwordHash: 'hashed:12341234',
			}),
		);
	});

	it('blocks inactive users from changing the password', async () => {
		const scenario = makeUsersScenario();

		await expect(
			scenario.executeChangePassword({ clientStatus: 'blocked' }),
		).rejects.toBeInstanceOf(ForbiddenError);
	});

	it('throws ForbiddenError when the current password hash is missing', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.getUserPasswordHashById.mockResolvedValue(
			null,
		);

		await expect(scenario.executeChangePassword()).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('throws ForbiddenError when the current password does not match', async () => {
		const scenario = makeUsersScenario()
			.withCurrentPasswordHash('other-hash')
			.withPasswordComparisonResult(false);

		await expect(scenario.executeChangePassword()).rejects.toBeInstanceOf(
			ForbiddenError,
		);
	});

	it('throws ConflictError when the repository reports a duplicate', async () => {
		const scenario = makeUsersScenario().withCurrentPasswordHash();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'User already exists',
		});

		await expect(scenario.executeChangePassword()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeUsersScenario().withCurrentPasswordHash();
		scenario.mocks.commandsRepository.updateCurrentUser.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeChangePassword()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
