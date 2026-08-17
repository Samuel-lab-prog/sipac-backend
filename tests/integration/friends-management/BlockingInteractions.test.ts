import { clearDatabase } from '@ClearDatabase';
import { beforeEach, describe, expect, it } from 'bun:test';

import {
	acceptFriendRequest,
	blockUser,
	getUserProfile,
	sendFriendRequest,
	unblockUser,
	type AuthUser,
} from '../endpoints/Index';

import type {
	BlockedUserRecord,
	FriendRequestRecord,
} from '@Domains/friends-management/ports/models';

import type { UserPrivateProfile } from '@Domains/users-management/ports/models';
import { expectAppError } from '@GenericSubdomains/utils/testing/utils';
import { setupHttpUsers } from 'tests/integration/TestsSetups.ts';

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
	it('User can block another user', async () => {
		const blocked = (await blockUser(
			user1.cookie,
			user2.id,
		)) as BlockedUserRecord;

		expect(blocked.blockedById).toBe(user1.id);
		expect(blocked.blockedUserId).toBe(user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('User cannot block the same user twice', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await blockUser(user1.cookie, user2.id);
		expectAppError(result, 409);
	});

	it('Blocking removes existing friendship', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await acceptFriendRequest(user2.cookie, user1.id);

		await blockUser(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;

		expect(me.stats.friends.map((friend) => friend.id)).not.toContain(user2.id);
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('Blocked user cannot receive a friend request', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await sendFriendRequest(user1.cookie, user2.id);
		expectAppError(result, 409);
	});

	it('Blocked user cannot send a friend request', async () => {
		await blockUser(user1.cookie, user2.id);

		const result = await sendFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 409);
	});

	it('Blocked user cannot accept a pending friend request', async () => {
		await sendFriendRequest(user1.cookie, user2.id);
		await blockUser(user1.cookie, user2.id);

		const result = await acceptFriendRequest(user2.cookie, user1.id);
		expectAppError(result, 409);
	});

	it('Blocked user does not appear in friends list', async () => {
		await blockUser(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		expect(me.stats.friends.map((friend) => friend.id)).not.toContain(user2.id);
	});

	it('Blocked user appears in blocked list', async () => {
		await blockUser(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		expect(me.blockedUsersIds).toContain(user2.id);
	});

	it('User can unblock another user', async () => {
		await blockUser(user1.cookie, user2.id);
		await unblockUser(user1.cookie, user2.id);

		const me = (await getUserProfile(
			user1.cookie,
			user1.id,
		)) as unknown as UserPrivateProfile;
		expect(me.blockedUsersIds).not.toContain(user2.id);
	});

	it('After unblock, users can send friend requests again', async () => {
		await blockUser(user1.cookie, user2.id);
		await unblockUser(user1.cookie, user2.id);

		const request = (await sendFriendRequest(
			user1.cookie,
			user2.id,
		)) as FriendRequestRecord;

		expect(request.requesterId).toBe(user1.id);
		expect(request.addresseeId).toBe(user2.id);
	});
});
