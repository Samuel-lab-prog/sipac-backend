import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeInteractionsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Interactions - UnlikePoem', () => {
	describe('Successful execution', () => {
		it('should unlike an existing poem like', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withPoemLikeExists(true)
				.withPoemLikeDeleted();

			const result = await scenario.executeRemoveLike();
			expect(result).toBeUndefined();
		});
	});

	describe('User validation', () => {
		it('should throw NotFoundError when user does not exist', async () => {
			const scenario = makeInteractionsScenario().withUser({ exists: false });
			await expectError(scenario.executeRemoveLike(), NotFoundError);
		});

		it('should throw ForbiddenError when user is inactive', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'suspended',
			});
			await expectError(scenario.executeRemoveLike(), ForbiddenError);
		});

		it('should throw ForbiddenError when user is banned', async () => {
			const scenario = makeInteractionsScenario().withUser({
				status: 'banned',
			});
			await expectError(scenario.executeRemoveLike(), ForbiddenError);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ exists: false });
			await expectError(scenario.executeRemoveLike(), NotFoundError);
		});

		it('should throw ForbiddenError when poem is not approved', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ moderationStatus: 'pending' });
			await expectError(scenario.executeRemoveLike(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is not published', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ status: 'draft' });
			await expectError(scenario.executeRemoveLike(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem has invalid visibility', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem({ visibility: 'private' });
			await expectError(scenario.executeRemoveLike(), ForbiddenError);
		});
	});

	describe('Like existence', () => {
		it('should throw NotFoundError when like does not exist', async () => {
			const scenario = makeInteractionsScenario()
				.withUser()
				.withPoem()
				.withPoemLikeExists(false);
			await expectError(scenario.executeRemoveLike(), NotFoundError);
		});
	});

	describe('Error propagation', () => {
		it('should propagate dependency errors', async () => {
			const scenario = makeInteractionsScenario().withUser().withPoem();
			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);
			await expectError(scenario.executeRemoveLike(), Error);
		});
	});
});
