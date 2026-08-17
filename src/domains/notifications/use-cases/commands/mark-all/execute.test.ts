import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeNotificationsScenario } from '../../test-helpers/Helper';

describe.concurrent(
	'USE-CASE - Notifications - MarkAllNotificationsAsRead',
	() => {
		describe('Successful execution', () => {
			it('should mark all notifications as read', async () => {
				const scenario = makeNotificationsScenario()
					.withUser()
					.withAllNotificationsMarkedAsRead();

				await expect(scenario.markAllAsRead()).resolves.toBeUndefined();
			});
		});

		describe('User validation', () => {
			it('should throw NotFoundError when user does not exist', async () => {
				const scenario = makeNotificationsScenario().withUser({
					exists: false,
				});

				await expectError(scenario.markAllAsRead(), NotFoundError);
			});

			it('should allow suspended users', async () => {
				const scenario = makeNotificationsScenario()
					.withUser({
						status: 'suspended',
					})
					.withAllNotificationsMarkedAsRead();

				await expect(scenario.markAllAsRead()).resolves.toBeUndefined();
			});

			it('should throw ForbiddenError when user is banned', async () => {
				const scenario = makeNotificationsScenario().withUser({
					status: 'banned',
				});

				await expectError(scenario.markAllAsRead(), ForbiddenError);
			});
		});

		describe('Dependency errors', () => {
			it('should not swallow errors from usersContract', async () => {
				const scenario = makeNotificationsScenario().withUser();

				scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
					new Error('boom'),
				);

				await expectError(scenario.markAllAsRead(), Error);
			});

			it('should not swallow errors from commandsRepository', async () => {
				const scenario = makeNotificationsScenario().withUser();

				scenario.mocks.commandsRepository.markAllAsRead.mockRejectedValue(
					new Error('repository failure'),
				);

				await expectError(scenario.markAllAsRead(), Error);
			});
		});
	},
);
