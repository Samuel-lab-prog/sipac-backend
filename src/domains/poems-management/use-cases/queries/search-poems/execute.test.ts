import { ForbiddenError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makePoemsScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Poems Management - SearchPoems', () => {
	describe('Successful execution', () => {
		it('should return poems page with filters', async () => {
			const scenario = makePoemsScenario().withPoemsPage();

			const result = await scenario.executeSearchPoems({
				navigationOptions: { limit: 10 },
				filterOptions: {
					searchTitle: 'love',
					tags: ['romance'],
				},
				sortOptions: {
					orderBy: 'createdAt',
					orderDirection: 'desc',
				},
			});
			expect(result).toHaveProperty('poems');
		});

		it('should use default limit when not provided', async () => {
			const scenario = makePoemsScenario().withPoemsPage();

			await scenario.executeSearchPoems({
				navigationOptions: {},
			});

			expect(scenario.mocks.queriesRepository.selectPoems).toHaveBeenCalledWith(
				expect.objectContaining({
					navigationOptions: expect.objectContaining({
						limit: 20,
					}),
				}),
			);
		});

		it('should cap limit to maximum allowed', async () => {
			const scenario = makePoemsScenario().withPoemsPage();

			await scenario.executeSearchPoems({
				navigationOptions: { limit: 999 },
			});

			expect(scenario.mocks.queriesRepository.selectPoems).toHaveBeenCalledWith(
				expect.objectContaining({
					navigationOptions: expect.objectContaining({
						limit: 100,
					}),
				}),
			);
		});
	});

	describe('Requester validation', () => {
		it('should throw ForbiddenError for banned requester', () => {
			const scenario = makePoemsScenario();

			const promise = scenario.executeSearchPoems({
				requesterStatus: 'banned',
				navigationOptions: {},
			});
			expect(promise).rejects.toBeInstanceOf(ForbiddenError);
		});

		it('should not call repository when requester is banned (fail fast)', () => {
			const scenario = makePoemsScenario();

			expectError(
				scenario.executeSearchPoems({
					requesterStatus: 'banned',
					navigationOptions: {},
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.queriesRepository.selectPoems,
			).not.toHaveBeenCalled();
		});
	});

	describe('Error propagation', () => {
		it('should not swallow repository errors', async () => {
			const scenario = makePoemsScenario();

			scenario.mocks.queriesRepository.selectPoems.mockRejectedValue(
				new Error('DB exploded'),
			);

			await expectError(
				scenario.executeSearchPoems({
					navigationOptions: {},
				}),
				Error,
			);
		});
	});
});
