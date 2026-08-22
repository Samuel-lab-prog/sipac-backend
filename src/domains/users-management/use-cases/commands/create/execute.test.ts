import { describe, expect, it } from 'bun:test';
import {
	ConflictError,
	UnprocessableEntityError,
	UnknownError,
} from '@DomainError';
import {
	DEFAULT_USER_CPF,
	DEFAULT_USER_EMAIL,
	DEFAULT_USER_ID,
	DEFAULT_USER_NAME,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_PASSWORD_HASH,
	DEFAULT_USER_RG,
	makeUsersScenario,
} from '../../test-helpers';

describe('UNIT - Users Management > Create User', () => {
	it('creates a user and hashes the password before persisting', async () => {
		const scenario = makeUsersScenario().withCreatedUser();

		await expect(scenario.executeCreateUser()).resolves.toMatchObject({
			id: DEFAULT_USER_ID,
			email: DEFAULT_USER_EMAIL,
		});

		expect(scenario.mocks.commandsRepository.insertUser).toHaveBeenCalledTimes(
			1,
		);
		expect(scenario.mocks.commandsRepository.insertUser).toHaveBeenCalledWith(
			expect.objectContaining({
				name: DEFAULT_USER_NAME,
				nickname: DEFAULT_USER_NICKNAME,
				email: DEFAULT_USER_EMAIL,
				passwordHash: DEFAULT_USER_PASSWORD_HASH,
				rg: DEFAULT_USER_RG,
				cpf: DEFAULT_USER_CPF,
			}),
		);
	});

	it('throws UnprocessableEntityError when the repository rejects validation', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.insertUser.mockResolvedValue({
			ok: false,
			code: 'VALIDATION',
			message: 'Invalid payload',
		});

		await expect(scenario.executeCreateUser()).rejects.toBeInstanceOf(
			UnprocessableEntityError,
		);
	});

	it('throws ConflictError when the repository reports a duplicate user', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.insertUser.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'User already exists',
		});

		await expect(scenario.executeCreateUser()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.commandsRepository.insertUser.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeCreateUser()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
