import { ConflictError, UnknownError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it, mock } from 'bun:test';
import { createCollectionFactory } from './execute';

describe.concurrent('USE-CASE - Poems Management - CreateCollection', () => {
	const makeSut = () => {
		const commandsRepository = {
			createCollection: mock(),
		};

		return {
			sut: createCollectionFactory({
				commandsRepository: commandsRepository as never,
				queriesRepository: {} as never,
			}),
			commandsRepository,
		};
	};

	const meta = {
		requesterId: 1,
		requesterRole: 'author' as const,
		requesterStatus: 'active' as const,
	};

	it('should create collection', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.createCollection.mockResolvedValue({ ok: true });

		await sut({
			data: { userId: 1, name: 'Favorites', description: 'My poems' },
			meta,
		});

		expect(commandsRepository.createCollection).toHaveBeenCalledWith({
			data: { userId: 1, name: 'Favorites', description: 'My poems' },
		});
	});

	it('should throw ConflictError when repository reports duplicated collection', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.createCollection.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
		});

		await expectError(
			sut({
				data: { userId: 1, name: 'Favorites', description: 'My poems' },
				meta,
			}),
			ConflictError,
		);
	});

	it('should throw UnknownError for unknown failures', async () => {
		const { sut, commandsRepository } = makeSut();
		commandsRepository.createCollection.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
		});

		await expectError(
			sut({
				data: { userId: 1, name: 'Favorites', description: 'My poems' },
				meta,
			}),
			UnknownError,
		);
	});
});
