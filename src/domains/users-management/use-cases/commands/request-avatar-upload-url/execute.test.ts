import { UnprocessableEntityError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { requestAvatarUploadUrlFactory } from './execute';

describe('USE-CASE - Users Management - RequestAvatarUploadUrl', () => {
	let storageService: any;
	let requestAvatarUploadUrl: any;

	beforeEach(() => {
		storageService = {
			validateImageContentType: mock(),
			generateAvatarUploadUrl: mock(),
		};

		requestAvatarUploadUrl = requestAvatarUploadUrlFactory({
			storageService,
		});
	});

	it('should require content type', async () => {
		await expectError(
			requestAvatarUploadUrl({
				requesterId: 1,
				contentType: '',
			}),
			UnprocessableEntityError,
		);
	});

	it('should reject invalid content type', async () => {
		storageService.validateImageContentType.mockReturnValue(false);

		await expectError(
			requestAvatarUploadUrl({
				requesterId: 1,
				contentType: 'text/plain',
			}),
			UnprocessableEntityError,
		);
	});

	it('should reject invalid content length', async () => {
		await expectError(
			requestAvatarUploadUrl({
				requesterId: 1,
				contentType: 'image/png',
				contentLength: 0,
			}),
			UnprocessableEntityError,
		);
	});

	it('should request an upload url for valid content type', async () => {
		storageService.validateImageContentType.mockReturnValue(true);
		storageService.generateAvatarUploadUrl.mockResolvedValue({
			uploadUrl: 'https://uploads.example.com/avatar',
			fields: { key: 'avatars/7/abc.png' },
			fileUrl: 'https://cdn.example.com/avatar.png',
		});

		const result = await requestAvatarUploadUrl({
			requesterId: 7,
			contentType: 'image/png',
		});

		expect(result).toEqual({
			uploadUrl: 'https://uploads.example.com/avatar',
			fields: { key: 'avatars/7/abc.png' },
			fileUrl: 'https://cdn.example.com/avatar.png',
		});
		expect(storageService.generateAvatarUploadUrl).toHaveBeenCalledWith(
			'7',
			'image/png',
			undefined,
		);
	});

	it('should default requester id to guest when missing', async () => {
		storageService.validateImageContentType.mockReturnValue(true);
		storageService.generateAvatarUploadUrl.mockResolvedValue({
			uploadUrl: 'https://uploads.example.com/avatar',
			fields: { key: 'avatars/guest/abc.png' },
			fileUrl: 'https://cdn.example.com/avatar.png',
		});

		await requestAvatarUploadUrl({
			contentType: 'image/png',
		});

		expect(storageService.generateAvatarUploadUrl).toHaveBeenCalledWith(
			'guest',
			'image/png',
			undefined,
		);
	});
});
