import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - GetPoemComments', () => {
	describe('Successful execution', () => {
		it('should list comments for public poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areBlocked: false })
				.withExistingComments();

			const result = await scenario.executeGetPoemComments();

			expect(result.comments).toHaveLength(1);
		});

		it('should allow friend to list comments for friends-only poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withExistingComments();

			const result = await scenario.executeGetPoemComments();

			expect(result.comments).toHaveLength(1);
		});

		it('should allow author to list comments even if not friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1, visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false })
				.withExistingComments();

			const result = await scenario.executeGetPoemComments();

			expect(result.comments).toHaveLength(1);
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({
				exists: false,
			});

			await expectError(scenario.executeGetPoemComments(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});

		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areBlocked: true });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ exists: false });

			await expectError(scenario.executeGetPoemComments(), NotFoundError);
		});

		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'private' });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});

		it('should throw ForbiddenError for unapproved poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});

		it('should throw ForbiddenError for draft poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ status: 'draft' });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});

		it('should throw ForbiddenError when comments are disabled', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ isCommentable: false });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});
	});

	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poem when not friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: false, areBlocked: false });

			await expectError(scenario.executeGetPoemComments(), ForbiddenError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeGetPoemComments(), Error);
		});
	});
});
