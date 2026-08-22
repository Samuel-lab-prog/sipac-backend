import { describe, expect, it, mock } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import { createFileUploadUrlFactory } from './execute';

describe('files > createFileUploadUrl', () => {
	it('creates an upload url', async () => {
		const sut = createFileUploadUrlFactory({
			storageService: {
				validateFileContentType: mock(() => true),
				generateFileUploadUrl: mock(async () => ({
					uploadUrl: 'https://example.com/upload',
					fields: { key: 'file' },
					fileUrl: 'https://example.com/file.pdf',
				})),
				generateAvatarUploadUrl: mock(),
				validateImageContentType: mock(),
				generatePoemAudioUploadUrl: mock(),
				validateAudioContentType: mock(),
			},
		});

		await expect(
			sut({
				prefix: 'attachments',
				fileName: 'file.pdf',
				contentType: 'application/pdf',
			}),
		).resolves.toMatchObject({ uploadUrl: 'https://example.com/upload' });
	});

	it('blocks invalid content types', () => {
		const sut = createFileUploadUrlFactory({
			storageService: {
				validateFileContentType: mock(() => false),
				generateFileUploadUrl: mock(),
				generateAvatarUploadUrl: mock(),
				validateImageContentType: mock(),
				generatePoemAudioUploadUrl: mock(),
				validateAudioContentType: mock(),
			},
		});

		expect(() =>
			sut({
				prefix: 'attachments',
				fileName: 'file.exe',
				contentType: 'application/x-msdownload',
			}),
		).toThrow(ForbiddenError);
	});
});
