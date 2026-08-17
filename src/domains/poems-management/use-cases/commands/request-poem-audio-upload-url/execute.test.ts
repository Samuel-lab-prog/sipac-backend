import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { makeAuthorPoem } from '../../test-helpers/Givens';
import { requestPoemAudioUploadUrlFactory } from './execute';

describe('USE-CASE - Poems Management - RequestPoemAudioUploadUrl', () => {
	let storageService: any;
	let queriesRepository: any;
	let requestPoemAudioUploadUrl: any;

	beforeEach(() => {
		storageService = {
			validateAudioContentType: mock(),
			generatePoemAudioUploadUrl: mock(),
		};
		queriesRepository = {
			selectPoemById: mock(),
		};

		requestPoemAudioUploadUrl = requestPoemAudioUploadUrlFactory({
			storageService,
			queriesRepository,
		});
	});

	it('should require content type', async () => {
		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: '',
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			UnprocessableEntityError,
		);
	});

	it('should reject invalid content type', async () => {
		storageService.validateAudioContentType.mockReturnValue(false);

		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: 'text/plain',
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			UnprocessableEntityError,
		);
	});

	it('should reject invalid content length', async () => {
		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: 'audio/mpeg',
				contentLength: 0,
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			UnprocessableEntityError,
		);
	});

	it('should forbid when author is not active', async () => {
		storageService.validateAudioContentType.mockReturnValue(true);
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 1 } }),
		);

		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: 'audio/mpeg',
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
		storageService.validateAudioContentType.mockReturnValue(true);
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 999 } }),
		);

		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: 'audio/mpeg',
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
		storageService.validateAudioContentType.mockReturnValue(true);
		queriesRepository.selectPoemById.mockResolvedValue(null);

		await expectError(
			requestPoemAudioUploadUrl({
				poemId: 1,
				contentType: 'audio/mpeg',
				meta: {
					requesterId: 1,
					requesterStatus: 'active',
					requesterRole: 'author',
				},
			}),
			NotFoundError,
		);
	});

	it('should request an upload url for valid content type', async () => {
		storageService.validateAudioContentType.mockReturnValue(true);
		queriesRepository.selectPoemById.mockResolvedValue(
			makeAuthorPoem({ author: { id: 1 } }),
		);
		storageService.generatePoemAudioUploadUrl.mockResolvedValue({
			uploadUrl: 'https://uploads.example.com/poem-audio',
			fields: { key: 'poems/1/audio/abc.mp3' },
			fileUrl: 'https://cdn.example.com/poems/1/audio.mp3',
		});

		const result = await requestPoemAudioUploadUrl({
			poemId: 1,
			contentType: 'audio/mpeg',
			meta: {
				requesterId: 1,
				requesterStatus: 'active',
				requesterRole: 'author',
			},
		});

		expect(result).toEqual({
			uploadUrl: 'https://uploads.example.com/poem-audio',
			fields: { key: 'poems/1/audio/abc.mp3' },
			fileUrl: 'https://cdn.example.com/poems/1/audio.mp3',
		});
		expect(storageService.generatePoemAudioUploadUrl).toHaveBeenCalledWith(
			'1',
			'audio/mpeg',
			undefined,
		);
	});
});
