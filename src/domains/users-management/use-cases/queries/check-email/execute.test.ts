import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent(
	'USE-CASE - Users Management - CheckEmailAvailability',
	() => {
		describe('Successful execution', () => {
			it('should return true when email is available', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findEmail.mockResolvedValue(true);

				const result = await scenario.executeCheckEmailAvailability(
					'available@olapoesia.dev',
				);

				expect(result).toBeTrue();
			});

			it('should return false when email is not available', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findEmail.mockResolvedValue(false);

				const result =
					await scenario.executeCheckEmailAvailability('used@olapoesia.dev');

				expect(result).toBeFalse();
			});

			it('should query repository with provided email', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findEmail.mockResolvedValue(true);

				await scenario.executeCheckEmailAvailability('email@olapoesia.dev');

				expect(scenario.mocks.queriesRepository.findEmail).toHaveBeenCalledWith(
					'email@olapoesia.dev',
				);
			});
		});

		describe('Error propagation', () => {
			it('should not swallow repository errors', async () => {
				const scenario = makeUsersManagementScenario();
				scenario.mocks.queriesRepository.findEmail.mockRejectedValue(
					new Error('DB exploded'),
				);

				await expectError(scenario.executeCheckEmailAvailability(), Error);
			});
		});
	},
);
