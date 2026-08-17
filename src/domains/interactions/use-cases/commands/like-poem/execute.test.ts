import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - LikePoem', () => {
	describe('Successful execution', () => {
		it('should like a public poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'public' })
				.withPoemLikeExists(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.executeLikePoem();
			expect(result).toBeUndefined();
		});

		it('should like an unlisted poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'unlisted' })
				.withPoemLikeExists(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.executeLikePoem();
			expect(result).toBeUndefined();
		});

		it('should like a friends-only poem when users are friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withPoemLikeExists(false)
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.executeLikePoem();
			expect(result).toBeUndefined();
		});

		it('should allow the author to like their own friends-only poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1 })
				.withPoem({ visibility: 'friends', authorId: 1 })
				.withPoemLikeExists(false)
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withPoemLikeCreated();

			const result = await scenario.executeLikePoem();
			expect(result).toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeLikePoem(), NotFoundError);
		});
		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeLikePoem(), ForbiddenError);
		});
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeLikePoem(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.executeLikePoem(), NotFoundError);
		});

		it('should throw ForbiddenError for private poems if user is not author', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 2 })
				.withPoem({ visibility: 'private', authorId: 1 });
			await expectError(scenario.executeLikePoem(), ForbiddenError);
		});
	});

	describe('Relation rules', () => {
		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areBlocked: true, areFriends: false });
			await expectError(scenario.executeLikePoem(), ForbiddenError);
		});

		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false });
			await expectError(scenario.executeLikePoem(), ForbiddenError);
		});
	});

	describe('Already liked', () => {
		it('should throw ConflictError when poem is already liked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'public' })
				.withPoemLikeExists(true)
				.withUsersRelation({ areFriends: false, areBlocked: false });
			await expectError(scenario.executeLikePoem(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeLikePoem(), Error);
		});
	});
});
