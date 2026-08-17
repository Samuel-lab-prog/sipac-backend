import { ForbiddenError, NotFoundError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { deleteCollectionFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - DeleteCollection', () => {
	const makeSut = () => {
		const commandsRepository = {
			deleteCollection: mock(),
		};

		return {
			sut: deleteCollectionFactory({
				commandsRepository: commandsRepository as never,
			}),
			commandsRepository,
		};
	};

	const meta = {
		requesterId: 1,
		requesterRole: 'author' as const,
		requesterStatus: 'active' as const,
	};

	it('should delete collection', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.deleteCollection.mockResolvedValue({ ok: true });

		await sut({ collectionId: 7, meta });

		expect(commandsRepository.deleteCollection).toHaveBeenCalledWith({
			collectionId: 7,
			userId: 1,
		});
	});

	it('should throw NotFoundError when collection does not exist', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.deleteCollection.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
		});

		await expectError(sut({ collectionId: 7, meta }), NotFoundError);
	});

	it('should throw ForbiddenError when requester has no permission', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.deleteCollection.mockResolvedValue({
			ok: false,
			code: 'FORBIDDEN',
		});

		await expectError(sut({ collectionId: 7, meta }), ForbiddenError);
	});

	it('should throw UnknownError for unknown failures', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.deleteCollection.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
		});

		await expectError(sut({ collectionId: 7, meta }), UnknownError);
	});
});
