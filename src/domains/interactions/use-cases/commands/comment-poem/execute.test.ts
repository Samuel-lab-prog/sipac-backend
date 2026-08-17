import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { describe, expect, it } from 'bun:test';

import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - CommentPoem', () => {
	describe('Successful execution', () => {
		it('should create a comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
			const result = await scenario.executeCommentPoem();
			expect(result).toHaveProperty('commentId');
		});
		it('should allow exactly 3000 characters', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
			const result = await scenario.executeCommentPoem({
				content: 'a'.repeat(3000),
			});

			expect(result).toHaveProperty('commentId');
		});
		it('should create a reply when parent comment is available', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withFoundComment()
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();

			const result = await scenario.executeCommentPoem({ parentId: 1 });

			expect(result).toHaveProperty('commentId');
		});
	});
	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeCommentPoem(), NotFoundError);
		});
		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError when users are blocked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withUsersRelation({ areFriends: false, areBlocked: true });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
	});
	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.executeCommentPoem(), NotFoundError);
		});
		it('should throw ForbiddenError for private poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'private' });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError for poems under moderation', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError for rejected poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'rejected' });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError for removed poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'removed' });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError for poems that do not allow comments', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ isCommentable: false });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError for unpublished poems', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ status: 'draft' });
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should throw ForbiddenError when replying to a banned author comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withFoundComment({
					author: {
						id: 2,
						avatarUrl: 'http://example.com/avatar.jpg',
						nickname: 'nickname',
						status: 'banned',
					},
				})
				.withUsersRelation({ areFriends: true, areBlocked: false });

			await expectError(
				scenario.executeCommentPoem({ parentId: 1 }),
				ForbiddenError,
			);

			expect(
				scenario.mocks.commandsRepository.createPoemComment,
			).not.toHaveBeenCalled();
		});
	});

	describe('Comment content validation', () => {
		it('should throw UnprocessableEntityError for empty comments', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();
			await expectError(
				scenario.executeCommentPoem({ content: '   ' }),
				UnprocessableEntityError,
			);
		});
		it('should throw UnprocessableEntityError when content exceeds 3000 characters', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();
			await expectError(
				scenario.executeCommentPoem({ content: 'a'.repeat(3001) }),
				UnprocessableEntityError,
			);
		});
	});
	describe('Visibility rules', () => {
		it('should throw ForbiddenError for friends-only poems when users are not friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withUsersRelation()
				.withPoem({ visibility: 'friends' });

			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
		it('should allow comments on friends-only poems when users are friends', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'friends' })
				.withUsersRelation({ areFriends: true, areBlocked: false })
				.withCreatedComment();
			const result = await scenario.executeCommentPoem();
			expect(result).toHaveProperty('commentId', 1);
		});
		it('should allow owner to comment on their own non-private poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1 })
				.withUsersRelation()
				.withCreatedComment();
			const result = await scenario.executeCommentPoem();
			expect(result).toHaveProperty('commentId', 1);
		});
		it('should throw ForbiddenError when owner comments on their own private poem', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1 })
				.withPoem({ authorId: 1, visibility: 'private' })
				.withCreatedComment();
			await expectError(scenario.executeCommentPoem(), ForbiddenError);
		});
	});
	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeCommentPoem(), Error);
		});
	});
});
