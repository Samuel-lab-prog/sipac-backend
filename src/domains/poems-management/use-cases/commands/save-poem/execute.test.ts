import { ConflictError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { savePoemFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - SavePoem', () => {
	const makeSut = () => {
		const commandsRepository = {
			savePoem: mock(),
		};

		const queriesRepository = {
			selectPoemById: mock(),
		};

		const usersContract = {
			selectUserBasicInfo: mock(),
		};

		return {
			sut: savePoemFactory({
				commandsRepository: commandsRepository as never,
				queriesRepository: queriesRepository as never,
				usersContract: usersContract as never,
			}),
			commandsRepository,
			queriesRepository,
			usersContract,
		};
	};

	it('should save a poem for an allowed user', async () => {
		const { sut, commandsRepository, queriesRepository, usersContract } =
			makeSut();

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'active',
			role: 'author',
			nickname: 'user',
		});
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 11,
			author: { id: 2 },
		});
		commandsRepository.savePoem.mockResolvedValue({
			ok: true,
			data: undefined,
		});

		await sut({
			poemId: 11,
			userId: 1,
		});

		expect(usersContract.selectUserBasicInfo).toHaveBeenCalledWith(1);
		expect(queriesRepository.selectPoemById).toHaveBeenCalledWith(11);
		expect(commandsRepository.savePoem).toHaveBeenCalledWith({
			poemId: 11,
			userId: 1,
		});
	});

	it('should throw ConflictError when user tries to save their own poem', async () => {
		const { sut, queriesRepository, usersContract, commandsRepository } =
			makeSut();

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'active',
			role: 'author',
			nickname: 'user',
		});
		queriesRepository.selectPoemById.mockResolvedValue({
			id: 11,
			author: { id: 1 },
		});

		await expectError(
			sut({
				poemId: 11,
				userId: 1,
			}),
			ConflictError,
		);

		expect(commandsRepository.savePoem).not.toHaveBeenCalled();
	});
});
