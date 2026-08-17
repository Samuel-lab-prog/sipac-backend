import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - UpdateComment', () => {
	describe('Successful execution', () => {
		it('should update a comment for the owner', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 10 })
				.withFoundComment({
					author: { id: 10, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withCommentUpdated();

			const result = await scenario.executeUpdateComment({
				userId: 10,
				content: 'updated content',
			});

			expect(result).toBeUndefined();
		});

		it('should allow admin to update any comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ role: 'admin', id: 1 })
				.withFoundComment({
					author: { id: 999, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withCommentUpdated();

			await expect(scenario.executeUpdateComment()).resolves.toBeUndefined();
		});

		it('should allow moderator to update any comment', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ role: 'moderator', id: 1 })
				.withFoundComment({
					author: { id: 999, avatarUrl: 'aha', nickname: 'nickname' },
				})
				.withCommentUpdated();

			await expect(scenario.executeUpdateComment()).resolves.toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });

			await expectError(scenario.executeUpdateComment(), NotFoundError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});

			await expectError(scenario.executeUpdateComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is suspended', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});

			await expectError(scenario.executeUpdateComment(), ForbiddenError);
		});

		it('should not query comment when user is invalid (fail fast)', () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });

			expectError(scenario.executeUpdateComment(), NotFoundError);

			expect(
				scenario.mocks.queriesRepository.selectCommentById,
			).not.toHaveBeenCalled();
		});
	});

	describe('Comment validation', () => {
		it('should throw NotFoundError when comment does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser();

			await expectError(scenario.executeUpdateComment(), NotFoundError);
		});

		it('should throw ForbiddenError when comment is already deleted by author', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({ status: 'deletedByAuthor' });

			await expectError(scenario.executeUpdateComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when comment is already deleted by moderator', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withFoundComment({ status: 'deletedByModerator' });

			await expectError(scenario.executeUpdateComment(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is not the owner and not admin/moderator', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({
					author: { id: 2, avatarUrl: 'aha', nickname: 'nickname' },
				});

			await expectError(scenario.executeUpdateComment(), ForbiddenError);
		});

		it('should not call update when validation fails', async () => {
			const scenario = makeInteractionsScenario()
				.withUser({ id: 1, role: 'author' })
				.withFoundComment({
					author: { id: 2, avatarUrl: 'aha', nickname: 'nickname' },
				});

			await expectError(scenario.executeUpdateComment(), ForbiddenError);

			expect(
				scenario.mocks.commandsRepository.updateComment,
			).not.toHaveBeenCalled();
		});
	});

	describe('Content validation', () => {
		it('should throw UnprocessableEntityError when content is empty', async () => {
			const scenario = makeInteractionsScenario().withUser().withFoundComment();

			await expectError(
				scenario.executeUpdateComment({ content: '' }),
				UnprocessableEntityError,
			);
		});

		it('should throw UnprocessableEntityError when content exceeds max length', async () => {
			const scenario = makeInteractionsScenario().withUser().withFoundComment();

			const longContent = 'a'.repeat(3001);

			await expectError(
				scenario.executeUpdateComment({ content: longContent }),
				UnprocessableEntityError,
			);
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

			await expectError(scenario.executeUpdateComment(), Error);
		});

		it('should propagate update repository errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withFoundComment();

			scenario.mocks.commandsRepository.updateComment.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(scenario.executeUpdateComment(), Error);
		});
	});
});
