import { ForbiddenError, NotFoundError } from '@DomainError';
import { describe, expect, it } from 'bun:test';

import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { makeNotificationsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Notifications - DeleteNotification', () => {
	describe('Successful execution', () => {
		it('should delete a notification', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationDeleted();

			const result = await scenario.deleteNotification();

			expect(result).toHaveProperty('id');
		});

		it('should allow custom params', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationDeleted();

			const result = await scenario.deleteNotification({
				notificationId: 999,
			});

			expect(result).toHaveProperty('id');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });

			await expectError(scenario.deleteNotification(), NotFoundError);
		});

		it('should allow suspended users', async () => {
			const scenario = makeNotificationsScenario()
				.withUser({
					status: 'suspended',
				})
				.withNotificationDeleted();

			await expect(scenario.deleteNotification()).resolves.toBeDefined();
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.deleteNotification(), ForbiddenError);
		});
	});

	describe('Notification validation', () => {
		it('should throw NotFoundError when notification does not exist', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationDeleteFailure('NOT_FOUND');
			await expectError(scenario.deleteNotification(), NotFoundError);
		});
	});

	describe('Repository errors', () => {
		it('should throw domain error when repository returns failure', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationDeleteFailure(
					'UNKNOWN',
					'Failed to delete notification',
				);

			await expectError(scenario.deleteNotification(), Error);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.deleteNotification(), Error);
		});
	});
});
