import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - UpdatePoem', () => {
	describe('Successful execution', () => {
		it('should update a poem', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withSlug('updated-title')
				.withUpdatedPoem(99);

			const result = await scenario.executeUpdatePoem({
				poemId: 1,
				data: { title: 'Updated title', content: 'Updated content' },
			});

			expect(result).toHaveProperty('id', 99);
		});

		it('should persist transformed data with generated slug', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withSlug('updated-title')
				.withUpdatedPoem();

			await scenario.executeUpdatePoem({
				poemId: 1,
				data: { title: 'Updated title', content: 'Updated content' },
			});

			expect(scenario.mocks.commandsRepository.updatePoem).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					title: 'Updated title',
					content: 'Updated content',
					slug: 'updated-title',
				}),
			);
		});
	});

	describe('User validation', () => {
		it('should throw ForbiddenError when author is not active', async () => {
			const scenario = makePoemsScenario().withPoem({ author: { id: 1 } });

			await expectError(
				scenario.executeUpdatePoem({
					meta: { requesterStatus: 'banned' },
				}),
				ForbiddenError,
			);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makePoemsScenario().withPoemNotFound();

			await expectError(scenario.executeUpdatePoem(), NotFoundError);
		});

		it('should throw ForbiddenError when requester is not the poem author', async () => {
			const scenario = makePoemsScenario().withPoem({ author: { id: 999 } });

			await expectError(scenario.executeUpdatePoem(), ForbiddenError);
		});

		it('should throw ForbiddenError when poem is published', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'published',
			});

			await expectError(scenario.executeUpdatePoem(), ForbiddenError);
		});

		it('should allow updating a published rejected poem', async () => {
			const scenario = makePoemsScenario()
				.withPoem({
					author: { id: 1 },
					status: 'published',
					moderationStatus: 'rejected',
				})
				.withSlug('updated-title')
				.withUpdatedPoem();

			const result = await scenario.executeUpdatePoem({
				data: { title: 'Updated title', content: 'Updated content' },
			});

			expect(result).toHaveProperty('id');
			expect(scenario.mocks.commandsRepository.updatePoem).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					moderationStatus: 'pending',
				}),
			);
		});

		it('should approve published poems updated by moderators immediately', async () => {
			const scenario = makePoemsScenario()
				.withUser({ role: 'moderator' })
				.withPoem({
					author: { id: 1 },
					status: 'published',
					moderationStatus: 'rejected',
				})
				.withSlug('updated-title')
				.withUpdatedPoem();

			await scenario.executeUpdatePoem({
				data: { title: 'Updated title', content: 'Updated content' },
				meta: { requesterRole: 'moderator' },
			});

			expect(scenario.mocks.commandsRepository.updatePoem).toHaveBeenCalledWith(
				1,
				expect.objectContaining({
					moderationStatus: 'approved',
				}),
			);
		});

		it('should throw ForbiddenError when poem is removed', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 1 },
				status: 'draft',
				moderationStatus: 'removed',
			});

			await expectError(scenario.executeUpdatePoem(), ForbiddenError);
		});
	});

	describe('Repository response handling', () => {
		it('should throw ConflictError when repository reports conflict', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withSlug('updated-title');

			scenario.mocks.commandsRepository.updatePoem.mockResolvedValue({
				ok: false,
				code: 'CONFLICT',
				data: null,
			});

			await expectError(scenario.executeUpdatePoem(), ConflictError);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario()
				.withPoem({ author: { id: 1 }, status: 'draft' })
				.withSlug('updated-title');

			scenario.mocks.commandsRepository.updatePoem.mockResolvedValue({
				ok: false,
				error: new Error('boom'),
				data: null,
				code: 'UNKNOWN',
			});

			await expectError(scenario.executeUpdatePoem(), Error);
		});

		it('should propagate query dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPoemById.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeUpdatePoem(), Error);
		});
	});
});
