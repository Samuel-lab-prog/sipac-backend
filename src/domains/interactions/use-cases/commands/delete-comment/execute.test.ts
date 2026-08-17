import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - DeleteComment', () => {
	describe('Successful execution', () => {
		it('should delete a comment for the owner', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 10 })
				.withFoundComment({
					author: { id: 10, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withDeletedComment();

			const result = await scenario.executeDeleteComment({
				userId: 10,
				commentId: 5,
			});
			expect(result).toBeUndefined();
		});

		it('should allow admin to delete any comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ role: 'admin', id: 1 })
				.withFoundComment({
					author: { id: 999, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withDeletedComment();

			await expect(scenario.executeDeleteComment()).resolves.toBeUndefined();
			expect(
				scenario.mocks.commandsRepository.deletePoemComment,
			).toHaveBeenCalledWith({
				commentId: 1,
				deletedBy: 'deletedByModerator',
			});
		});

		it('should allow moderator to delete any comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ role: 'moderator', id: 1 })
				.withFoundComment({
					author: { id: 999, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withDeletedComment();

			await expect(scenario.executeDeleteComment()).resolves.toBeUndefined();
			expect(
				scenario.mocks.commandsRepository.deletePoemComment,
			).toHaveBeenCalledWith({
				commentId: 1,
				deletedBy: 'deletedByModerator',
			});
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });

			await expectError(scenario.executeDeleteComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});

		it('should not query comment when user is invalid (fail fast)', () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });

			expectError(scenario.executeDeleteComment(), NotFoundError);

			expect(
				scenario.mocks.queriesRepository.selectCommentById,
			).not.toHaveBeenCalled();
		});
	});

	describe('Comment validation', () => {
		it('should throw NotFoundError when comment does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser();

			await expectError(scenario.executeDeleteComment(), NotFoundError);
		});

		it('should throw ForbiddenError when comment is already deleted by author', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({ status: 'deletedByAuthor' });

			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when comment is already deleted by moderator', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({ status: 'deletedByModerator' });

			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is not the owner and not admin/moderator', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({
					author: { id: 2, avatarUrl: 'aha', nickname: 'nickname' },
				});

			await expectError(scenario.executeDeleteComment(), ForbiddenError);
		});

		it('should not call delete when validation fails', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({
					author: { id: 2, avatarUrl: 'aha', nickname: 'nickname' },
				});

			await expectError(scenario.executeDeleteComment(), ForbiddenError);

			expect(
				scenario.mocks.commandsRepository.deletePoemComment,
			).not.toHaveBeenCalled();
		});
	});

	describe('Error propagation', () => {
		it('should not swallow usersContract errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withFoundComment();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error(
					'Something exploded in the server. Please do not repeat the request.',
				),
			);

			await expectError(scenario.executeDeleteComment(), Error);
		});

		it('should propagate delete repository errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withFoundComment();

			scenario.mocks.commandsRepository.deletePoemComment.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeDeleteComment(), Error);
		});
	});
});
