import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import type { EventName } from '@SharedKernel/events/EventBus';
import { describe, expect, it } from 'bun:test';
import { makeModerationPoemScenario } from '../../test-helpers/PoemModerationHelper';

describe.concurrent('USE-CASE - Moderation - ModeratePoem', () => {
	describe('Successful execution', () => {
		it('should update poem moderation status', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending' })
				.withModeratedPoem({ id: 12, moderationStatus: 'approved' });

			const result = await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			expect(result).toHaveProperty('id', 12);
			expect(
				scenario.mocks.commandsRepository.updatePoemModerationStatus,
			).toHaveBeenCalledWith({
				poemId: 1,
				moderationStatus: 'approved',
			});
		});

		it('should allow removing a poem', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending' })
				.withModeratedPoem({ id: 12, moderationStatus: 'removed' });

			const result = await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'removed',
			});

			expect(result).toHaveProperty('id', 12);
			expect(
				scenario.mocks.commandsRepository.updatePoemModerationStatus,
			).toHaveBeenCalledWith({
				poemId: 1,
				moderationStatus: 'removed',
			});
		});

		it('should allow rejecting a poem', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending' })
				.withModeratedPoem({ id: 12, moderationStatus: 'rejected' });

			const result = await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'rejected',
			});

			expect(result).toHaveProperty('id', 12);
			expect(
				scenario.mocks.commandsRepository.updatePoemModerationStatus,
			).toHaveBeenCalledWith({
				poemId: 1,
				moderationStatus: 'rejected',
			});
		});
	});

	describe('Permissions', () => {
		it('should throw ForbiddenError when requester is not moderator/admin', async () => {
			const scenario = makeModerationPoemScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'author',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationPoemScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterStatus: 'banned',
						requesterRole: 'moderator',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});
	});

	describe('Validation', () => {
		it('should throw ForbiddenError for invalid moderation status', async () => {
			const scenario = makeModerationPoemScenario().withPoem();

			await expectError(
				scenario.executeModeratePoem({
					moderationStatus: 'invalid-status' as never,
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});

		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeModerationPoemScenario().withPoemNotFound();

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when poem is removed', async () => {
			const scenario = makeModerationPoemScenario().withPoem({
				moderationStatus: 'removed',
			});

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				ForbiddenError,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makeModerationPoemScenario().withPoem();

			scenario.mocks.commandsRepository.updatePoemModerationStatus.mockResolvedValue(
				{
					ok: false,
					data: null,
					error: new Error('boom'),
					code: 'UNKNOWN',
				},
			);

			await expectError(
				scenario.executeModeratePoem({
					meta: {
						requesterRole: 'moderator',
						requesterStatus: 'active',
						requesterId: 123,
					},
				}),
				Error,
			);
		});
	});

	describe('Notifications', () => {
		it('should notify author, dedicated users, and mentioned users for public poems', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending', visibility: 'public' })
				.withNotificationsData()
				.withModeratedPoem({ moderationStatus: 'approved' });

			await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			const publishCalls = scenario.mocks.eventBus.publish.mock.calls as Array<
				[EventName, Record<string, unknown>]
			>;
			const eventNames = publishCalls.map(([name]) => name);

			expect(eventNames).toContain('POEM_APPROVED');
			expect(
				eventNames.filter((name) => name === 'POEM_DEDICATED'),
			).toHaveLength(2);
			expect(
				eventNames.filter((name) => name === 'USER_MENTION_IN_POEM'),
			).toHaveLength(2);
		});

		it('should only notify friends when poem visibility is friends-only', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending', visibility: 'friends' })
				.withNotificationsData({
					authorFriendIds: [21, 30],
					dedicatedUserIds: [20, 21],
					mentionedUserIds: [30, 31],
				})
				.withModeratedPoem({ moderationStatus: 'approved' });

			await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			const publishCalls = scenario.mocks.eventBus.publish.mock.calls as Array<
				[EventName, { userId?: number }]
			>;
			const dedicatedTargets = publishCalls
				.filter(([name]) => name === 'POEM_DEDICATED')
				.map(([, payload]) => payload.userId)
				.filter((id): id is number => typeof id === 'number');
			const mentionedTargets = publishCalls
				.filter(([name]) => name === 'USER_MENTION_IN_POEM')
				.map(([, payload]) => payload.userId)
				.filter((id): id is number => typeof id === 'number');

			expect(dedicatedTargets).toEqual([21]);
			expect(mentionedTargets).toEqual([30]);
		});

		it('should only notify the author for unlisted poems', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending', visibility: 'unlisted' })
				.withNotificationsData()
				.withModeratedPoem({ moderationStatus: 'approved' });

			await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			const publishCalls = scenario.mocks.eventBus.publish.mock.calls as Array<
				[EventName, Record<string, unknown>]
			>;
			const eventNames = publishCalls.map(([name]) => name);

			expect(eventNames).toContain('POEM_APPROVED');
			expect(eventNames).not.toContain('POEM_DEDICATED');
			expect(eventNames).not.toContain('USER_MENTION_IN_POEM');
		});

		it('should not notify anyone for private poems', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending', visibility: 'private' })
				.withNotificationsData()
				.withModeratedPoem({ moderationStatus: 'approved' });

			await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'approved',
			});

			expect(scenario.mocks.eventBus.publish).not.toHaveBeenCalled();
		});

		it('should notify the author when a poem is rejected', async () => {
			const scenario = makeModerationPoemScenario()
				.withPoem({ moderationStatus: 'pending', visibility: 'public' })
				.withModeratedPoem({ moderationStatus: 'rejected' });

			await scenario.executeModeratePoem({
				poemId: 1,
				moderationStatus: 'rejected',
			});

			const publishCalls = scenario.mocks.eventBus.publish.mock.calls as Array<
				[EventName, Record<string, unknown>]
			>;
			const eventNames = publishCalls.map(([name]) => name);

			expect(eventNames).toContain('POEM_REJECTED');
			expect(eventNames).not.toContain('POEM_APPROVED');
			expect(eventNames).not.toContain('POEM_REMOVED');
		});
	});
});
