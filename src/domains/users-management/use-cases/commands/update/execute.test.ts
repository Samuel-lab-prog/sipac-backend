import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import {
	DEFAULT_TARGET_ID,
	DEFAULT_UPDATE_USER_DATA,
} from '../../test-helpers/Constants';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - UpdateUser', () => {
	describe('Successful execution', () => {
		it('should update user data successfully', async () => {
			const scenario = makeUsersManagementScenario().withUserUpdated({
				nickname: 'new_nickname',
			});

			const result = await scenario.executeUpdateUser({
				data: { nickname: 'new_nickname' },
			});

			expect(result).toHaveProperty('nickname', 'new_nickname');
		});

		it('should call repository with targetId and merged payload', async () => {
			const scenario = makeUsersManagementScenario().withUserUpdated();

			await scenario.executeUpdateUser();

			expect(scenario.mocks.commandsRepository.updateUser).toHaveBeenCalledWith(
				DEFAULT_TARGET_ID,
				DEFAULT_UPDATE_USER_DATA,
			);
		});
	});

	describe('Authorization rules', () => {
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeUpdateUser({ requesterStatus: 'banned' }),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError for cross-user updates', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeUpdateUser({ targetId: 999 }),
				ForbiddenError,
			);
		});

		it('should not call repository when authorization fails', async () => {
			const scenario = makeUsersManagementScenario();

			await expectError(
				scenario.executeUpdateUser({
					requesterId: 1,
					targetId: 2,
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.commandsRepository.updateUser,
			).not.toHaveBeenCalled();
		});
	});

	describe('Conflict handling', () => {
		it('should throw ConflictError when nickname is already in use', async () => {
			const scenario = makeUsersManagementScenario().withUpdateConflict(
				'nickname already in use',
			);

			await expectError(scenario.executeUpdateUser(), ConflictError);
		});

		it('should throw ConflictError when email is already in use', async () => {
			const scenario = makeUsersManagementScenario().withUpdateConflict(
				'email already in use',
			);

			await expectError(scenario.executeUpdateUser(), ConflictError);
		});

		it('should throw UnknownError for unknown conflict messages', async () => {
			const scenario = makeUsersManagementScenario().withUpdateConflict(
				'some other conflict',
			);

			await expectError(scenario.executeUpdateUser(), UnknownError);
		});
	});

	describe('Error propagation', () => {
		it('should throw UnknownError for non-conflict repository failures', async () => {
			const scenario = makeUsersManagementScenario().withUpdateFailure();

			await expectError(scenario.executeUpdateUser(), UnknownError);
		});

		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.commandsRepository.updateUser.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeUpdateUser(), Error);
		});
	});
});
