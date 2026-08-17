import { ForbiddenError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { removeSavedPoemFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - RemoveSavedPoem', () => {
	const makeSut = () => {
		const commandsRepository = {
			removeSavedPoem: mock(),
		};

		const usersContract = {
			selectUserBasicInfo: mock(),
		};

		return {
			sut: removeSavedPoemFactory({
				commandsRepository: commandsRepository as never,
				queriesRepository: {} as never,
				usersContract: usersContract as never,
			}),
			commandsRepository,
			usersContract,
		};
	};

	it('should remove saved poem for requester', async () => {
		const { sut, usersContract, commandsRepository } = makeSut();

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'active',
			role: 'author',
			nickname: 'user',
		});
		commandsRepository.removeSavedPoem.mockResolvedValue({ ok: true });

		await sut({
			poemId: 11,
			meta: {
				requesterId: 1,
				requesterRole: 'author',
				requesterStatus: 'active',
			},
		});

		expect(usersContract.selectUserBasicInfo).toHaveBeenCalledWith(1);
		expect(commandsRepository.removeSavedPoem).toHaveBeenCalledWith({
			poemId: 11,
			userId: 1,
		});
	});

	it('should throw ForbiddenError when user is invalid for operation', async () => {
		const { sut, usersContract } = makeSut();

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'banned',
			role: 'author',
			nickname: 'user',
		});

		await expectError(
			sut({
				poemId: 11,
				meta: {
					requesterId: 1,
					requesterRole: 'author',
					requesterStatus: 'active',
				},
			}),
			ForbiddenError,
		);
	});

	it('should throw UnknownError when repository fails', async () => {
		const { sut, usersContract, commandsRepository } = makeSut();

		usersContract.selectUserBasicInfo.mockResolvedValue({
			exists: true,
			id: 1,
			status: 'active',
			role: 'author',
			nickname: 'user',
		});
		commandsRepository.removeSavedPoem.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
		});

		await expectError(
			sut({
				poemId: 11,
				meta: {
					requesterId: 1,
					requesterRole: 'author',
					requesterStatus: 'active',
				},
			}),
			UnknownError,
		);
	});
});
