import { ForbiddenError, NotFoundError } from '@DomainError';
import { describe, expect, it } from 'bun:test';

import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { makeNotificationsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Notifications - MarkNotificationAsRead', () => {
	describe('Successful execution', () => {
		it('should mark notification as read', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationMarkedAsRead();

			const result = await scenario.markAsRead();

			expect(result).toHaveProperty('id');
		});

		it('should allow custom params', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withNotificationMarkedAsRead();

			const result = await scenario.markAsRead({
				notificationId: 999,
			});

			expect(result).toHaveProperty('id');
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeNotificationsScenario().withUser({ exists: false });

			await expectError(scenario.markAsRead(), NotFoundError);
		});

		it('should allow suspended users', async () => {
			const scenario = makeNotificationsScenario()
				.withUser({
					status: 'suspended',
				})
				.withNotificationMarkedAsRead();

			await expect(scenario.markAsRead()).resolves.toBeDefined();
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeNotificationsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.markAsRead(), ForbiddenError);
		});
	});

	describe('Notification validation', () => {
		it('should throw NotFoundError when notification does not exist', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withMarkNotificationAsReadFailure('NOT_FOUND');

			await expectError(scenario.markAsRead(), NotFoundError);
		});
	});

	describe('Repository errors', () => {
		it('should throw domain error when repository returns failure', async () => {
			const scenario = makeNotificationsScenario()
				.withUser()
				.withMarkNotificationAsReadFailure(
					'UNKNOWN',
					'Failed to update notification',
				);

			await expectError(scenario.markAsRead(), Error);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeNotificationsScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.markAsRead(), Error);
		});
	});
});
