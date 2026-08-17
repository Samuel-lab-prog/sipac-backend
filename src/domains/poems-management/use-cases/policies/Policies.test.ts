import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../test-helpers/Helper';
import { validateUsers } from './Policies';

describe.concurrent('POLICY - Poems Management', () => {
	describe('validateUsers', () => {
		it('should pass when no user IDs are provided', async () => {
			const scenario = makePoemsScenario().withUser();

			await expect(
				validateUsers(scenario.mocks.usersContract, 1),
			).resolves.toBeUndefined();
		});

		it('should throw ForbiddenError when author tries to dedicate to themselves', async () => {
			const scenario = makePoemsScenario().withUser();

			await expectError(
				validateUsers(scenario.mocks.usersContract, 1, [1]),
				ForbiddenError,
			);
		});

		it('should throw UnprocessableEntityError when dedicated user is inactive', async () => {
			const scenario = makePoemsScenario().withUser({ status: 'banned' });

			await expectError(
				validateUsers(scenario.mocks.usersContract, 1, [2]),
				UnprocessableEntityError,
			);
		});
	});

	/* -------------------------------------------------
		 canCreatePoem
	------------------------------------------------- */
	describe('canCreatePoem', () => {
		it('should allow active author with valid dedicated users', async () => {
			const scenario = makePoemsScenario().withUser();

			await expect(
				scenario.executeCanCreatePoem({
					author: { id: 1, status: 'active' },
					toUserIds: [2],
				}),
			).resolves.toBeUndefined();
		});

		it('should throw UnprocessableEntityError for invalid dedicated users', async () => {
			const scenario = makePoemsScenario().withUser({ status: 'suspended' });

			await expectError(
				scenario.executeCanCreatePoem({ toUserIds: [2] }),
				UnprocessableEntityError,
			);
		});
	});

	/* -------------------------------------------------
		 canUpdatePoem
	------------------------------------------------- */
	describe('canUpdatePoem', () => {
		it('should allow update when author is active and poem is editable', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withPoem({
					id: 1,
					author: { id: 1 },
					status: 'draft',
					moderationStatus: 'approved',
				});

			await expect(
				scenario.executeCanUpdatePoem({ poemId: 1 }),
			).resolves.toBeUndefined();
		});

		it('should throw ForbiddenError when author is inactive', async () => {
			const scenario = makePoemsScenario().withPoem();

			await expectError(
				scenario.executeCanUpdatePoem({ author: { status: 'banned' } }),
				ForbiddenError,
			);
		});

		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makePoemsScenario().withPoemNotFound();

			await expectError(
				scenario.executeCanUpdatePoem({ poemId: 1 }),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when requester is not the poem author', async () => {
			const scenario = makePoemsScenario().withPoem({ author: { id: 999 } });

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is published', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'published',
			});

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});

		it('should allow update when a published poem was rejected', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'published',
				moderationStatus: 'rejected',
			});

			await expect(scenario.executeCanUpdatePoem()).resolves.toBeUndefined();
		});

		it('should throw ForbiddenError when poem is removed', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'removed',
			});

			await expectError(scenario.executeCanUpdatePoem(), ForbiddenError);
		});
	});

	/* -------------------------------------------------
		 canViewPoem
	------------------------------------------------- */
	describe('canViewPoem', () => {
		it('should allow author to view their own poem', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 1 },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'draft',
					visibility: 'private',
					moderationStatus: 'removed',
				},
			});

			expect(result).toBe(true);
		});

		it('should deny banned viewer', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, status: 'banned' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(false);
		});

		it('should allow public approved published poems for anonymous viewer', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: {},
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(true);
		});

		it('should allow unlisted poem only with direct access', () => {
			const scenario = makePoemsScenario();

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1, directAccess: false },
					poem: {
						id: 1,
						status: 'published',
						visibility: 'unlisted',
						moderationStatus: 'approved',
					},
				}),
			).toBe(false);

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1, directAccess: true },
					poem: {
						id: 1,
						status: 'published',
						visibility: 'unlisted',
						moderationStatus: 'approved',
					},
				}),
			).toBe(true);
		});

		it('should allow friends-only poem only for friends', () => {
			const scenario = makePoemsScenario();

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1, friendIds: [] },
					poem: {
						id: 1,
						status: 'published',
						visibility: 'friends',
						moderationStatus: 'approved',
					},
				}),
			).toBe(false);

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1, friendIds: [2] },
					poem: {
						id: 1,
						status: 'published',
						visibility: 'friends',
						moderationStatus: 'approved',
					},
				}),
			).toBe(true);
		});

		it('should deny non-approved or draft poems for non-authors', () => {
			const scenario = makePoemsScenario();

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1 },
					poem: {
						id: 1,
						status: 'published',
						visibility: 'public',
						moderationStatus: 'rejected',
					},
				}),
			).toBe(false);

			expect(
				scenario.executeCanViewPoem({
					viewer: { id: 2, status: 'active' },
					author: { id: 1 },
					poem: {
						id: 1,
						status: 'draft',
						visibility: 'public',
						moderationStatus: 'approved',
					},
				}),
			).toBe(false);
		});

		it('should allow moderator to view non-private poem', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, role: 'moderator', status: 'active' },
				author: { id: 1 },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(true);
		});

		it('should deny poems from banned authors to regular viewers', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, role: 'author', status: 'active' },
				author: { id: 1, status: 'banned' },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(false);
		});

		it('should allow active moderators to view poems from banned authors', () => {
			const scenario = makePoemsScenario();

			const result = scenario.executeCanViewPoem({
				viewer: { id: 2, role: 'moderator', status: 'active' },
				author: { id: 1, status: 'banned' },
				poem: {
					id: 1,
					status: 'published',
					visibility: 'public',
					moderationStatus: 'approved',
				},
			});

			expect(result).toBe(true);
		});
	});
});
