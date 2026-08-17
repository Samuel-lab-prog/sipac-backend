import { ForbiddenError, NotFoundError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { removeCollectionItemFactory } from './execute';

describe.concurrent(
	'USE-CASE - Poems Management - RemoveCollectionItem',
	() => {
		const makeSut = () => {
			const commandsRepository = {
				removeItemFromCollection: mock(),
			};

			return {
				sut: removeCollectionItemFactory({
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

		it('should remove item from collection', async () => {
			const { sut, commandsRepository } = makeSut();
			commandsRepository.removeItemFromCollection.mockResolvedValue({
				ok: true,
			});

			await sut({ collectionId: 7, poemId: 11, meta });

			expect(commandsRepository.removeItemFromCollection).toHaveBeenCalledWith({
				collectionId: 7,
				poemId: 11,
				userId: 1,
			});
		});

		it('should throw NotFoundError when item is missing', async () => {
			const { sut, commandsRepository } = makeSut();
			commandsRepository.removeItemFromCollection.mockResolvedValue({
				ok: false,
				code: 'NOT_FOUND',
			});

			await expectError(
				sut({ collectionId: 7, poemId: 11, meta }),
				NotFoundError,
			);
		});

		it('should throw ForbiddenError when user cannot modify collection', async () => {
			const { sut, commandsRepository } = makeSut();
			commandsRepository.removeItemFromCollection.mockResolvedValue({
				ok: false,
				code: 'FORBIDDEN',
			});

			await expectError(
				sut({ collectionId: 7, poemId: 11, meta }),
				ForbiddenError,
			);
		});

		it('should throw UnknownError for unknown failures', async () => {
			const { sut, commandsRepository } = makeSut();
			commandsRepository.removeItemFromCollection.mockResolvedValue({
				ok: false,
				code: 'UNKNOWN',
			});

			await expectError(
				sut({ collectionId: 7, poemId: 11, meta }),
				UnknownError,
			);
		});
	},
);
