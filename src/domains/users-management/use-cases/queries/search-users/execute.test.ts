import { ForbiddenError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeUsersManagementScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Users Management - GetUsers', () => {
	describe('Successful execution', () => {
		it('should return users page', async () => {
			const scenario = makeUsersManagementScenario().withUsersPage();

			const result = await scenario.executeGetUsers();

			expect(result).toHaveProperty('users');
			expect(result).toHaveProperty('hasMore');
		});

		it('should apply default limit when none is provided', async () => {
			const scenario = makeUsersManagementScenario().withUsersPage();

			await scenario.executeGetUsers();

			expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith(
				{
					navigationOptions: {
						limit: 20,
						cursor: undefined,
					},
					sortOptions: {
						orderBy: 'id',
						orderDirection: 'asc',
					},
					filterOptions: {
						searchNickname: undefined,
					},
				},
			);
		});

		it('should cap limit to max value', async () => {
			const scenario = makeUsersManagementScenario().withUsersPage();

			await scenario.executeGetUsers({
				navigationOptions: { limit: 1000 },
				sortOptions: { by: 'nickname', order: 'desc' },
			});

			expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith(
				{
					navigationOptions: {
						limit: 100,
						cursor: undefined,
					},
					sortOptions: {
						orderBy: 'nickname',
						orderDirection: 'desc',
					},
					filterOptions: {
						searchNickname: undefined,
					},
				},
			);
		});

		it('should forward cursor, filter and sorting options', async () => {
			const scenario = makeUsersManagementScenario().withUsersPage();

			await scenario.executeGetUsers({
				navigationOptions: { limit: 5, cursor: 44 },
				filterOptions: { searchNickname: 'ma' },
				sortOptions: { by: 'createdAt', order: 'desc' },
			});

			expect(scenario.mocks.queriesRepository.selectUsers).toHaveBeenCalledWith(
				{
					navigationOptions: {
						limit: 5,
						cursor: 44,
					},
					sortOptions: {
						orderBy: 'createdAt',
						orderDirection: 'desc',
					},
					filterOptions: {
						searchNickname: 'ma',
					},
				},
			);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when requester is banned', () => {
			const scenario = makeUsersManagementScenario();

			expect(() =>
				scenario.executeGetUsers({ requesterStatus: 'banned' }),
			).toThrow(ForbiddenError);
		});

		it('should not query repository when requester is banned (fail fast)', () => {
			const scenario = makeUsersManagementScenario();

			expect(() =>
				scenario.executeGetUsers({ requesterStatus: 'banned' }),
			).toThrow(ForbiddenError);
			expect(
				scenario.mocks.queriesRepository.selectUsers,
			).not.toHaveBeenCalled();
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeUsersManagementScenario();
			scenario.mocks.queriesRepository.selectUsers.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeGetUsers(), Error);
		});
	});
});
