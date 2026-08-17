import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - GetPoemById', () => {
	describe('Successful execution', () => {
		it('should return a public poem', async () => {
			const scenario = makePoemsScenario().withPoem({
				visibility: 'public',
				status: 'published',
				moderationStatus: 'approved',
			});

			const result = await scenario.executeGetPoemById({
				poemId: 1,
				requesterId: 10,
			});

			expect(result).toHaveProperty('id', 1);
		});

		it('should allow direct access to unlisted poem', async () => {
			const scenario = makePoemsScenario().withPoem({
				visibility: 'unlisted',
			});

			const result = await scenario.executeGetPoemById({
				poemId: 1,
				requesterId: 10,
			});

			expect(result).toHaveProperty('id', 1);
		});

		it('should allow author to access their own private poem', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 7 },
				visibility: 'private',
			});

			const result = await scenario.executeGetPoemById({
				poemId: 1,
				requesterId: 7,
			});

			expect(result).toHaveProperty('id', 1);
		});

		it('should allow friend to access friends-only poem', async () => {
			const scenario = makePoemsScenario().withPoem({
				visibility: 'friends',
				author: { id: 7, friendIds: [10] },
			});

			const result = await scenario.executeGetPoemById({
				poemId: 1,
				requesterId: 10,
			});

			expect(result).toHaveProperty('id', 1);
		});
	});

	describe('Poem validation', () => {
		it('should throw NotFoundError when poem does not exist', async () => {
			const scenario = makePoemsScenario().withPoemNotFound();

			await expectError(
				scenario.executeGetPoemById({ poemId: 1 }),
				NotFoundError,
			);
		});
	});

	describe('Visibility rules', () => {
		it('should throw ForbiddenError for private poem when requester is not author', async () => {
			const scenario = makePoemsScenario().withPoem({
				author: { id: 7 },
				visibility: 'private',
			});

			await expectError(
				scenario.executeGetPoemById({
					poemId: 1,
					requesterId: 10,
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError for friends-only poem when requester is not a friend', async () => {
			const scenario = makePoemsScenario().withPoem({
				visibility: 'friends',
				author: { id: 7, friendIds: [] },
			});

			await expectError(
				scenario.executeGetPoemById({
					poemId: 1,
					requesterId: 10,
				}),
				ForbiddenError,
			);
		});

		it('should throw ForbiddenError for banned requester', async () => {
			const scenario = makePoemsScenario().withPoem({
				visibility: 'public',
			});

			await expectError(
				scenario.executeGetPoemById({
					poemId: 1,
					requesterId: 10,
					requesterStatus: 'banned',
				}),
				ForbiddenError,
			);
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPoemById.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeGetPoemById({ poemId: 1 }), Error);
		});
	});
});
