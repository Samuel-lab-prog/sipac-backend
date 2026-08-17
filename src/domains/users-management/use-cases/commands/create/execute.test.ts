import { ConflictError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { DEFAULT_CREATE_USER_DATA } from '../../test-helpers/Constants';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - CreateUser', () => {
	describe('Successful execution', () => {
		it('should create user successfully', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword()
				.withUserCreated();

			const result = await scenario.executeCreateUser();

			expect(result).toHaveProperty('id', 1);
		});

		it('should hash password before persisting user', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword('custom_hash')
				.withUserCreated();

			await scenario.executeCreateUser();

			expect(scenario.mocks.hashServices.hash).toHaveBeenCalledWith(
				DEFAULT_CREATE_USER_DATA.password,
			);
			expect(scenario.mocks.commandsRepository.insertUser).toHaveBeenCalledWith(
				{
					...DEFAULT_CREATE_USER_DATA,
					passwordHash: 'custom_hash',
				},
			);
		});
	});

	describe('Conflict handling', () => {
		it('should throw ConflictError when nickname is already in use', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword()
				.withCreateConflict('nickname already in use');

			await expectError(scenario.executeCreateUser(), ConflictError);
		});

		it('should throw ConflictError when email is already in use', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword()
				.withCreateConflict('email already in use');

			await expectError(scenario.executeCreateUser(), ConflictError);
		});

		it('should throw UnknownError for unknown conflict messages', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword()
				.withCreateConflict('another unique key violation');

			await expectError(scenario.executeCreateUser(), UnknownError);
		});
	});

	describe('Error propagation', () => {
		it('should throw UnknownError for non-conflict repository failures', async () => {
			const scenario = makeUsersManagementScenario()
				.withHashedPassword()
				.withCreateFailure();

			await expectError(scenario.executeCreateUser(), UnknownError);
		});

		it('should not swallow hash service errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.hashServices.hash.mockRejectedValue(
				new Error('hash failed'),
			);

			await expectError(scenario.executeCreateUser(), Error);
			expect(
				scenario.mocks.commandsRepository.insertUser,
			).not.toHaveBeenCalled();
		});

		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario().withHashedPassword();
			scenario.mocks.commandsRepository.insertUser.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeCreateUser(), Error);
		});
	});
});
