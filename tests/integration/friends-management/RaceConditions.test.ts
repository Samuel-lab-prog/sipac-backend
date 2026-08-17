import { describe, it, beforeEach, expect } from 'bun:test';
import { clearDatabase } from '@ClearDatabase';

import {
	sendFriendRequest,
	acceptFriendRequest,
	type AuthUser,
	cancelFriendRequest,
	rejectFriendRequest,
	blockUser,
} from '../endpoints/Index';

import { setupHttpUsers } from 'tests/integration/TestsSetups.ts';
import { prisma } from '@Prisma/PrismaClient';

let user1: AuthUser;
let user2: AuthUser;

beforeEach(async () => {
	await clearDatabase();
	const users = await setupHttpUsers();

	if (!users[0] || !users[1])
		throw new Error('Not enough users set up for tests');

	user1 = users[0];
	user2 = users[1];
});

describe('INTEGRATION - Friends Management', () => {
	it('When simultaneous friend requests occur, at least one should succeed', async () => {
		const req1 = await sendFriendRequest(user1.cookie, user2.id);
		const req2 = await sendFriendRequest(user2.cookie, user1.id);
		const success = [req1, req2].some((r) => r && 'requesterId' in r);
		const error = [req1, req2].some((r) => r && 'statusCode' in r);
		expect(success).toBe(true);
		expect(error).toBe(true);
	});

	it('When simultaneous acceptances occur, at least one should succeed', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		const [accept1, accept2] = await Promise.allSettled([
			acceptFriendRequest(user2.cookie, user1.id),
			acceptFriendRequest(user1.cookie, user2.id),
		]);

		const success = [accept1, accept2].some((a) => a.status === 'fulfilled');
		expect(success).toBe(true);
	});

	it('When sending and canceling a friend request simultaneously, at least one should succeed', async () => {
		const results = await Promise.allSettled([
			sendFriendRequest(user1.cookie, user2.id),
			cancelFriendRequest(user1.cookie, user2.id),
		]);

		const success = results.some((r) => r.status === 'fulfilled');
		expect(success).toBe(true);

		const requests = await prisma.friendshipRequest.findMany();
		expect(requests.length).toBeLessThanOrEqual(1);
	});

	it('When accepting and rejecting a friend request simultaneously, at least one should succeed', async () => {
		await sendFriendRequest(user1.cookie, user2.id);

		await Promise.allSettled([
			acceptFriendRequest(user2.cookie, user1.id),
			rejectFriendRequest(user2.cookie, user1.id),
		]);

		const friendship = await prisma.friendship.findFirst({
			where: {
				OR: [
					{ userAId: user1.id, userBId: user2.id },
					{ userAId: user2.id, userBId: user1.id },
				],
			},
		});

		const request = await prisma.friendshipRequest.findFirst({
			where: { requesterId: user1.id, addresseeId: user2.id },
		});

		expect(request).toBeNull();

		if (friendship) {
			expect(friendship.userAId).toBeGreaterThan(0);
			expect(friendship.userBId).toBeGreaterThan(0);
		}
	});

	it('When canceling a friend request and blocking simultaneously, at least one should succeed', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await Promise.allSettled([
			cancelFriendRequest(user1.cookie, user2.id),
			blockUser(user2.cookie, user1.id),
		]);

		const request = await prisma.friendshipRequest.findFirst({
			where: { requesterId: user1.id, addresseeId: user2.id },
		});
		const block = await prisma.blockedUser.findFirst({
			where: { blockerId: user2.id, blockedId: user1.id },
		});

		expect(Boolean(request) !== Boolean(block)).toBe(true);
	});
});
