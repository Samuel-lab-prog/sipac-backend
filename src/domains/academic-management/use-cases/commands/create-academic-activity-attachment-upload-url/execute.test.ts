import { describe, expect, it, mock } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import { createAcademicActivityAttachmentUploadUrlFactory } from './execute';

describe('academic-management > createAcademicActivityAttachmentUploadUrl', () => {
	const actor = {
		actorId: 1,
		actorRole: 'staff' as const,
		actorStatus: 'active' as const,
		targetUserId: 1,
	};

	it('creates an upload url for an academic activity attachment', async () => {
		const sut = createAcademicActivityAttachmentUploadUrlFactory({
			storageService: {
				validateFileContentType: mock(() => true),
				generateFileUploadUrl: mock(() =>
					Promise.resolve({
						uploadUrl: 'https://example.com/upload',
						fields: { key: 'file' },
						fileUrl: 'https://example.com/file.pdf',
					}),
				),
				generateAvatarUploadUrl: mock(),
				validateImageContentType: mock(),
				generatePoemAudioUploadUrl: mock(),
				validateAudioContentType: mock(),
			},
		});

		await expect(
			sut({
				...actor,
				activityId: 1,
				data: {
					contentType: 'application/pdf',
					contentLength: 10,
					fileName: 'file.pdf',
				},
			}),
		).resolves.toMatchObject({
			uploadUrl: 'https://example.com/upload',
			fileUrl: 'https://example.com/file.pdf',
		});
	});

	it('blocks invalid file content types', () => {
		const sut = createAcademicActivityAttachmentUploadUrlFactory({
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
				...actor,
				activityId: 1,
				data: {
					contentType: 'application/x-msdownload',
					contentLength: 10,
					fileName: 'file.exe',
				},
			}),
		).toThrow(ForbiddenError);
	});
});
