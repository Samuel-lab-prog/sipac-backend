import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent(
	'USE-CASE - Users Management - CheckNicknameAvailability',
	() => {
		describe('Successful execution', () => {
			it('should return true when nickname is available', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findNickname.mockResolvedValue(true);

				const result =
					await scenario.executeCheckNicknameAvailability('available_name');

				expect(result).toBeTrue();
			});

			it('should return false when nickname is not available', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findNickname.mockResolvedValue(false);

				const result =
					await scenario.executeCheckNicknameAvailability('used_name');

				expect(result).toBeFalse();
			});

			it('should query repository with provided nickname', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findNickname.mockResolvedValue(true);

				await scenario.executeCheckNicknameAvailability('john_doe');

				expect(
					scenario.mocks.queriesRepository.findNickname,
				).toHaveBeenCalledWith('john_doe');
			});
		});

		describe('Error propagation', () => {
			it('should not swallow repository errors', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findNickname.mockRejectedValue(
					new Error('DB exploded'),
				);

				await expectError(scenario.executeCheckNicknameAvailability(), Error);
			});
		});
	},
);
