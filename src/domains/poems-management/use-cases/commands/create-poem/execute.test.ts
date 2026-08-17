import {
	ConflictError,
	ForbiddenError,
	UnprocessableEntityError,
} from '@DomainError';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - CreatePoem', () => {
	describe('Successful execution', () => {
		it('should create a poem', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withSlug('my-poem')
				.withCreatedPoem(42);

			const result = await scenario.executeCreatePoem({
				data: { title: 'My Poem', content: 'Some content' },
			});

			expect(result).toHaveProperty('id', 42);
		});

		it('should approve published poems created by moderators immediately', async () => {
			const scenario = makePoemsScenario()
				.withUser({ role: 'moderator' })
				.withSlug('my-poem')
				.withCreatedPoem();

			await scenario.executeCreatePoem({
				data: {
					title: 'My Poem',
					content: 'Some content',
					status: 'published',
				},
				meta: { requesterRole: 'moderator' },
			});

			expect(scenario.mocks.commandsRepository.insertPoem).toHaveBeenCalledWith(
				expect.objectContaining({
					status: 'published',
					moderationStatus: 'approved',
				}),
			);
		});

		it('should persist transformed data with generated slug', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withSlug('my-poem')
				.withCreatedPoem();

			await scenario.executeCreatePoem({
				data: { title: 'My Poem', content: 'Some content' },
			});

			expect(scenario.mocks.commandsRepository.insertPoem).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'My Poem',
					content: 'Some content',
					slug: 'my-poem',
					authorId: 1,
				}),
			);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when author is not active', async () => {
			const scenario = makePoemsScenario().withUser({ status: 'banned' });

			await expectError(
				scenario.executeCreatePoem({
					meta: { requesterStatus: 'banned' },
				}),
				ForbiddenError,
			);
		});
	});

	describe('Dedication validation', () => {
		it('should throw ForbiddenError when author dedicates the poem to themselves', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withSlug()
				.withCreatedPoem();

			await expectError(
				scenario.executeCreatePoem({
					data: { toUserIds: [1] },
				}),
				ForbiddenError,
			);
		});

		it('should throw UnprocessableEntityError when dedicated users are invalid', async () => {
			const scenario = makePoemsScenario()
				.withUser()
				.withSlug()
				.withCreatedPoem();

			const invalidUser: Awaited<
				ReturnType<UsersPublicContract['selectUserBasicInfo']>
			> = {
				exists: true,
				id: 99,
				status: 'banned',
				role: 'author',
				nickname: 'invalid-user',
			};
			scenario.mocks.usersContract.selectUserBasicInfo.mockResolvedValue(
				invalidUser,
			);
			scenario.mocks.usersContract.selectUsersBasicInfo.mockResolvedValue([
				invalidUser,
			]);

			await expectError(
				scenario.executeCreatePoem({
					data: { toUserIds: [99] },
				}),
				UnprocessableEntityError,
			);
		});
	});

	describe('Repository response handling', () => {
		it('should throw ConflictError when repository reports conflict', async () => {
			const scenario = makePoemsScenario().withUser().withSlug();

			scenario.mocks.commandsRepository.insertPoem.mockResolvedValue({
				ok: false,
				code: 'CONFLICT',
				data: null,
			});

			await expectError(scenario.executeCreatePoem(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario().withUser().withSlug();

			scenario.mocks.commandsRepository.insertPoem.mockResolvedValue({
				ok: false,
				error: new Error('boom'),
				code: 'UNKNOWN',
				data: null,
			});

			await expectError(scenario.executeCreatePoem(), Error);
		});

		it('should propagate users contract errors', async () => {
			const scenario = makePoemsScenario().withSlug().withCreatedPoem();

			scenario.mocks.usersContract.selectUsersBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(
				scenario.executeCreatePoem({ data: { toUserIds: [2] } }),
				Error,
			);
		});
	});
});
