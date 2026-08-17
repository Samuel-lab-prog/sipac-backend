import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - LikeComment', () => {
	describe('Successful execution', () => {
		it('should like a comment successfully', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment()
				.withCommentLikeCreated();

			const result = await scenario.executeLikeComment();
			expect(result).toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeLikeComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeLikeComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeLikeComment(), ForbiddenError);
		});
	});

	describe('Comment validation', () => {
		it('should throw NotFoundError when comment does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser();
			await expectError(scenario.executeLikeComment(), NotFoundError);
		});

		it('should throw ForbiddenError when comment is not visible', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({ status: 'deletedByAuthor' });

			await expectError(scenario.executeLikeComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when comment author is banned', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({
					author: {
						id: 2,
						avatarUrl: 'http://example.com/avatar.jpg',
						nickname: 'nickname',
						status: 'banned',
					},
				});

			await expectError(scenario.executeLikeComment(), ForbiddenError);

			expect(
				scenario.mocks.commandsRepository.createCommentLike,
			).not.toHaveBeenCalled();
		});
	});

	describe('Already liked', () => {
		it('should throw ConflictError when comment is already liked', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment()
				.withFoundCommentLike();
			await expectError(scenario.executeLikeComment(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeLikeComment(), Error);
		});
	});
});
