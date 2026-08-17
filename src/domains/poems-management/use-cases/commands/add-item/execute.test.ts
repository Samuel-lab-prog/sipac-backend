import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnknownError,
} from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { addCollectionItemFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - AddCollectionItem', () => {
	const makeSut = () => {
		const commandsRepository = {
			addItemToCollection: mock(),
		};

		return {
			sut: addCollectionItemFactory({
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

	it('should add item into collection', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.addItemToCollection.mockResolvedValue({ ok: true });

		await sut({ collectionId: 10, poemId: 20, meta });

		expect(commandsRepository.addItemToCollection).toHaveBeenCalledWith({
			collectionId: 10,
			poemId: 20,
			userId: 1,
		});
	});

	it('should throw ConflictError when item already exists', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.addItemToCollection.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
		});

		await expectError(
			sut({ collectionId: 10, poemId: 20, meta }),
			ConflictError,
		);
	});

	it('should throw NotFoundError when collection/poem is missing', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.addItemToCollection.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
		});

		await expectError(
			sut({ collectionId: 10, poemId: 20, meta }),
			NotFoundError,
		);
	});

	it('should throw ForbiddenError when user cannot edit collection', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.addItemToCollection.mockResolvedValue({
			ok: false,
			code: 'FORBIDDEN',
		});

		await expectError(
			sut({ collectionId: 10, poemId: 20, meta }),
			ForbiddenError,
		);
	});

	it('should throw UnknownError for unknown repository failures', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.addItemToCollection.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
		});

		await expectError(
			sut({ collectionId: 10, poemId: 20, meta }),
			UnknownError,
		);
	});
});
