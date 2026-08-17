import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { makeAuthorPoem } from '../../test-helpers/Givens';
import { updatePoemAudioFactory } from './execute';

describe('USE-CASE - Poems Management - UpdatePoemAudio', () => {
	let commandsRepository: any;
	let queriesRepository: any;
	let updatePoemAudio: any;

	beforeEach(() => {
		commandsRepository = {
			updatePoemAudio: mock(),
		};
		queriesRepository = {
			selectPoemById: mock(),
		};

		updatePoemAudio = updatePoemAudioFactory({
			commandsRepository,
			queriesRepository,
		});
	});

	it('should update the poem audio url', async () => {
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 1 } }),
		);

		const result = await updatePoemAudio({
			poemId: 1,
			audioUrl: 'https://cdn.example.com/poems/1/audio.mp3',
			meta: {
				requesterId: 1,
				requesterStatus: 'active',
				requesterRole: 'author',
			},
		});

		expect(result).toEqual({
			audioUrl: 'https://cdn.example.com/poems/1/audio.mp3',
		});
		expect(commandsRepository.updatePoemAudio).toHaveBeenCalledWith({
			poemId: 1,
			audioUrl: 'https://cdn.example.com/poems/1/audio.mp3',
		});
	});

	it('should forbid when author is not active', async () => {
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 1 } }),
		);

		await expectError(
			updatePoemAudio({
				poemId: 1,
				audioUrl: null,
				meta: {
					requesterId: 1,
					requesterStatus: 'banned',
					requesterRole: 'author',
				},
			}),
			ForbiddenError,
		);
	});

	it('should forbid when requester is not the author', async () => {
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 999 } }),
		);

		await expectError(
			updatePoemAudio({
				poemId: 1,
				audioUrl: null,
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			ForbiddenError,
		);
	});

	it('should forbid when poem is removed', async () => {
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ moderationStatus: 'removed', author: { id: 1 } }),
		);

		await expectError(
			updatePoemAudio({
				poemId: 1,
				audioUrl: null,
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			ForbiddenError,
		);
	});

	it('should fail when poem is not found', async () => {
		queriesRepository.selectPoemById.mockResolvedValue(null);

		await expectError(
			updatePoemAudio({
				poemId: 1,
				audioUrl: null,
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			NotFoundError,
		);
	});
});
