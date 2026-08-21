import { describe, expect, it, mock } from 'bun:test';
import { createInMemoryEventBus } from './event-bus';

describe('UNIT - Shared Kernel Events', () => {
	describe('event-bus', () => {
		it('publishes events to subscribed handlers in subscription order', async () => {
			const bus = createInMemoryEventBus();
			const calls: string[] = [];

			bus.subscribe('NEW_FRIEND', () => {
				calls.push('first');
			});
			bus.subscribe('NEW_FRIEND', () => {
				calls.push('second');
			});

			await bus.publish('NEW_FRIEND', {
				newFriendId: 1,
				newFriendNickname: 'ana',
				userId: 99,
				actorAvatarUrl: null,
			});

			expect(calls).toEqual(['first', 'second']);
		});

		it('supports unsubscribing from events', async () => {
			const bus = createInMemoryEventBus();
			const handler = mock(() => undefined);

			const unsubscribe = bus.subscribe('NEW_FRIEND', handler);
			unsubscribe();

			await bus.publish('NEW_FRIEND', {
				newFriendId: 1,
				newFriendNickname: 'ana',
				userId: 99,
			});

			expect(handler).not.toHaveBeenCalled();
		});

		it('executes once handlers only once', async () => {
			const bus = createInMemoryEventBus();
			const handler = mock(() => undefined);

			bus.once('NEW_FRIEND', handler);

			await bus.publish('NEW_FRIEND', {
				newFriendId: 1,
				newFriendNickname: 'ana',
				userId: 99,
			});
			await bus.publish('NEW_FRIEND', {
				newFriendId: 2,
				newFriendNickname: 'bia',
				userId: 99,
			});

			expect(handler).toHaveBeenCalledTimes(1);
			expect(handler).toHaveBeenCalledWith({
				newFriendId: 1,
				newFriendNickname: 'ana',
				userId: 99,
			});
		});

		it('waits for async handlers before completing publish', async () => {
			const bus = createInMemoryEventBus();
			const calls: string[] = [];
			const asyncHandler = mock(async () => {
				calls.push('handler-start');
				await new Promise((resolve) => setTimeout(resolve, 10));
				calls.push('handler-end');
			});

			bus.subscribe('NEW_FRIEND', asyncHandler);

			const publishPromise = bus.publish('NEW_FRIEND', {
				newFriendId: 1,
				newFriendNickname: 'ana',
				userId: 99,
			});

			calls.push('after-publish-call');
			await publishPromise;
			calls.push('after-await');

			expect(calls).toEqual([
				'handler-start',
				'after-publish-call',
				'handler-end',
				'after-await',
			]);
		});
	});
});
