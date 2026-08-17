import { describe, expect, it, mock } from 'bun:test';
import { getCollectionsFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - GetCollections', () => {
	const makeSut = () => {
		const queriesRepository = {
			selectCollections: mock(),
		};

		return {
			sut: getCollectionsFactory({
				queriesRepository: queriesRepository as never,
			}),
			queriesRepository,
		};
	};

	it('should return requester collections', async () => {
		const { sut, queriesRepository } = makeSut();
		const expected = [
			{
				id: 10,
				name: 'Favorites',
				description: 'My favorite poems',
				poemIds: [1, 2],
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];
		queriesRepository.selectCollections.mockResolvedValue(expected);

		const result = await sut({
			requesterId: 1,
			requesterRole: 'author',
			requesterStatus: 'active',
		});

		expect(result).toEqual(expected);
		expect(queriesRepository.selectCollections).toHaveBeenCalledWith(1);
	});

	it('should reject banned users', async () => {
		const { sut } = makeSut();

		await expect(() =>
			sut({
				requesterId: 1,
				requesterRole: 'author',
				requesterStatus: 'banned',
			}),
		).toThrow();
	});
});
