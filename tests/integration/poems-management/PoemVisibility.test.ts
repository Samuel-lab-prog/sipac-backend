import { clearDatabase } from '@ClearDatabase';
import { beforeEach, describe, expect, it } from 'bun:test';

import {
	createAndApprovePoem,
	createFriendshipRaw,
	createPoem,
	getAuthorPoems,
	getMyPoems,
	getPoemById,
	makePoem,
	updatePoemRaw,
	updateUserStatsRaw,
	type AuthUser,
} from '../endpoints/Index';

import type {
	AuthorPoem,
	CreatePoemResult,
} from '@Domains/poems-management/ports/models';

import { expectAppError } from '@GenericSubdomains/utils/testing/utils';
import { setupHttpUsers } from 'tests/integration/TestsSetups.ts';

let author: AuthUser;
let otherUser: AuthUser;
let thirdUser: AuthUser;

beforeEach(async () => {
	await clearDatabase();

	const users = await setupHttpUsers();
	if (!users[0] || !users[1] || !users[2])
		throw new Error('Not enough users set up for tests');

	author = users[0];
	otherUser = users[1];
	thirdUser = users[2];
});

describe('INTEGRATION - Poems Management ', () => {
	it('Author can always see all his poems regardless of visibility', async () => {
		await createPoem(
			author.cookie,
			makePoem(author.id, { visibility: 'private' }, 0),
		);
		await createPoem(
			author.cookie,
			makePoem(author.id, { visibility: 'unlisted' }, 1),
		);
		await createPoem(
			author.cookie,
			makePoem(author.id, { visibility: 'public' }, 2),
		);

		const poems = (await getMyPoems(author.cookie)) as AuthorPoem[];
		expect(poems).toHaveLength(3);
	});

	it('Private poems are visible only to their author', async () => {
		const poem = makePoem(author.id, {
			visibility: 'private',
			status: 'published',
		});

		const created = (await createAndApprovePoem(
			author.cookie,
			poem,
		)) as CreatePoemResult;

		expectAppError(await getPoemById(otherUser.cookie, created.id!), 403);

		const fetchedByAuthor = await getPoemById(author.cookie, created.id!);
		expect((fetchedByAuthor as AuthorPoem).id).toBe(created.id);
	});

	it('Friends-only poems are visible to friends after approval', async () => {
		const poem = makePoem(author.id, {
			visibility: 'friends',
			status: 'published',
		});

		const created = (await createPoem(author.cookie, poem)) as CreatePoemResult;

		expectAppError(await getPoemById(otherUser.cookie, created.id!), 403);

		await updatePoemRaw(created.id!, { moderationStatus: 'approved' });
		await createFriendshipRaw(author.id, otherUser.id);

		const fetched = await getPoemById(otherUser.cookie, created.id!);
		expect((fetched as AuthorPoem).id).toBe(created.id);
	});

	it('Unlisted poems are accessible only via direct link', async () => {
		const poem = makePoem(author.id, {
			visibility: 'unlisted',
			status: 'published',
		});

		const created = (await createAndApprovePoem(
			author.cookie,
			poem,
		)) as CreatePoemResult;

		const directAccess = await getPoemById(otherUser.cookie, created.id!);
		expect((directAccess as AuthorPoem).id).toBe(created.id);

		const listed = await getAuthorPoems(otherUser.cookie, author.id);
		expect(listed as AuthorPoem[]).toHaveLength(0);
	});

	it('Public poems are visible to everyone', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const created = (await createAndApprovePoem(
			author.cookie,
			poem,
		)) as CreatePoemResult;

		const fetched = await getPoemById(otherUser.cookie, created.id!);
		expect((fetched as AuthorPoem).id).toBe(created.id);

		const authorPoems = await getAuthorPoems(otherUser.cookie, author.id);
		expect(authorPoems as AuthorPoem[]).toHaveLength(1);
	});

	it('Draft poems are visible only to their author', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'draft',
		});

		const created = (await createPoem(author.cookie, poem)) as CreatePoemResult;

		expectAppError(await getPoemById(otherUser.cookie, created.id!), 403);
	});

	it('Poems not approved by moderation are visible only to their author', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const created = (await createPoem(author.cookie, poem)) as CreatePoemResult;

		expectAppError(await getPoemById(otherUser.cookie, created.id!), 403);

		const fetchedByAuthor = await getPoemById(author.cookie, created.id!);
		expect((fetchedByAuthor as AuthorPoem).content).toBe(poem.content);
	});

	it('Banned users cannot see poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const created = (await createAndApprovePoem(
			author.cookie,
			poem,
		)) as CreatePoemResult;

		await updateUserStatsRaw(otherUser.id, { status: 'banned' });

		expectAppError(await getPoemById(otherUser.cookie, created.id!), 401);
	});

	it('Moderators can see friends-only and unlisted poems but not private or draft', async () => {
		await updateUserStatsRaw(thirdUser.id, { role: 'moderator' });

		const friendsPoem = (await createAndApprovePoem(
			author.cookie,
			makePoem(author.id, { visibility: 'friends', status: 'published' }, 1),
		)) as CreatePoemResult;

		const unlistedPoem = (await createAndApprovePoem(
			author.cookie,
			makePoem(author.id, { visibility: 'unlisted', status: 'published' }, 2),
		)) as CreatePoemResult;

		const privatePoem = (await createAndApprovePoem(
			author.cookie,
			makePoem(author.id, { visibility: 'private', status: 'published' }, 3),
		)) as CreatePoemResult;

		const draftPoem = (await createPoem(
			author.cookie,
			makePoem(author.id, { visibility: 'public', status: 'draft' }, 4),
		)) as CreatePoemResult;

		expect(
			(await getPoemById(thirdUser.cookie, friendsPoem.id!)) as AuthorPoem,
		).toBeTruthy();
		expect(
			(await getPoemById(thirdUser.cookie, unlistedPoem.id!)) as AuthorPoem,
		).toBeTruthy();

		expectAppError(await getPoemById(thirdUser.cookie, privatePoem.id!), 403);

		expectAppError(await getPoemById(thirdUser.cookie, draftPoem.id!), 403);
	});

	it('Only logged users can access poems', async () => {
		const poem = makePoem(author.id, {
			visibility: 'public',
			status: 'published',
		});

		const created = (await createAndApprovePoem(
			author.cookie,
			poem,
		)) as CreatePoemResult;

		expectAppError(await getPoemById('', created.id!), 422);
	});
});
