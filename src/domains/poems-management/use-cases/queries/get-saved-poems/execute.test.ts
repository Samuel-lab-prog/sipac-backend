import { ForbiddenError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { getSavedPoemsFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - GetSavedPoems', () => {
	const makeSut = () => {
		const queriesRepository = {
			selectSavedPoems: mock(),
		};
		const usersContract = {
			selectUserBasicInfo: mock(),
		};

		return {
			sut: getSavedPoemsFactory({
				queriesRepository: queriesRepository as never,
				usersContract: usersContract as never,
			}),
			queriesRepository,
			usersContract,
		};
	};

	it('should return saved poems for requester', async () => {
		const { sut, usersContract, queriesRepository } = makeSut();
		const saved = [
			{
				id: 1,
				title: 'Poem',
				slug: 'poem',
				savedAt: new Date(),
				author: { id: 10, name: 'Author', nickname: 'author', avatarUrl: null },
			},
			{
				id: 2,
				title: 'Poem 2',
				slug: 'poem-2',
				savedAt: new Date(),
				author: {
					id: 11,
					name: 'Author 2',
					nickname: 'author2',
					avatarUrl: null,
				},
			},
		];

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'active',
			role: 'author',
			nickname: 'user',
		});
		queriesRepository.selectSavedPoems.mockResolvedValue(saved);

		const result = await sut({ requesterId: 1 });

		expect(result).toEqual(saved);
		expect(usersContract.selectUserBasicInfo).toHaveBeenCalledWith(1);
		expect(queriesRepository.selectSavedPoems).toHaveBeenCalledWith(1);
	});

	it('should reject banned users', async () => {
		const { sut, usersContract } = makeSut();
		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'banned',
			role: 'author',
			nickname: 'user',
		});

		await expectError(sut({ requesterId: 1 }), ForbiddenError);
	});
});
