import { afterEach, describe, expect, it, mock } from 'bun:test';

const ORIGINAL_ENV = {
	AWS_REGION: process.env.AWS_REGION,
	S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
	S3_SIGNED_URL_EXPIRES_IN: process.env.S3_SIGNED_URL_EXPIRES_IN,
	MAX_AVATAR_UPLOAD_BYTES: process.env.MAX_AVATAR_UPLOAD_BYTES,
	MAX_POEM_AUDIO_UPLOAD_BYTES: process.env.MAX_POEM_AUDIO_UPLOAD_BYTES,
	S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
	AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
	AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
};

function setEnv(key: keyof typeof ORIGINAL_ENV, value: string | undefined) {
	if (value === undefined) {
		delete process.env[key];
		return;
	}
	process.env[key] = value;
}

async function loadStorageService(options?: {
	presignedPostResult?: { url: string; fields: Record<string, string> };
	presignedPostError?: Error;
}) {
	const createPresignedPost = mock(
		async (_client: unknown, input: Record<string, unknown>) => {
			if (options?.presignedPostError) throw options.presignedPostError;
			return {
				url: options?.presignedPostResult?.url ?? 'https://upload.example.com',
				fields: options?.presignedPostResult?.fields ?? { key: 'value' },
				input,
			};
		},
	);
	const s3ClientCtor = mock(function S3Client(this: unknown, config: unknown) {
		return { config };
	});
	const logError = mock(() => undefined);

	await mock.module('@aws-sdk/s3-presigned-post', () => ({
		createPresignedPost,
	}));
	await mock.module('@aws-sdk/client-s3', () => ({
		S3Client: s3ClientCtor,
	}));
	await mock.module('@GenericSubdomains/utils/logging/logger', () => ({
		log: { error: logError },
	}));

	return {
		...(await import(
			`./storage-service.ts?test=${Date.now()}-${Math.random()}`
		)),
		mocks: { createPresignedPost, s3ClientCtor, logError },
	};
}

afterEach(() => {
	mock.restore();
	for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
		setEnv(key as keyof typeof ORIGINAL_ENV, value);
	}
});

describe('UNIT - Shared Kernel Infra', () => {
	describe('storage-service', () => {
		it('validates image and audio content types', async () => {
			const { storageService } = await loadStorageService();

			expect(storageService.validateImageContentType('image/png')).toBe(true);
			expect(storageService.validateImageContentType('text/plain')).toBe(false);
			expect(storageService.validateAudioContentType('audio/mpeg')).toBe(true);
			expect(
				storageService.validateAudioContentType('audio/mpeg; charset=binary'),
			).toBe(true);
			expect(storageService.validateAudioContentType('image/png')).toBe(false);
		});

		it('generates avatar upload urls with the configured defaults', async () => {
			setEnv('S3_BUCKET_NAME', 'test-bucket');
			setEnv('S3_PUBLIC_BASE_URL', 'https://cdn.example.com');
			setEnv('S3_SIGNED_URL_EXPIRES_IN', '600');
			setEnv('MAX_AVATAR_UPLOAD_BYTES', '12345');
			const { storageService, mocks } = await loadStorageService({
				presignedPostResult: {
					url: 'https://upload.example.com/avatar',
					fields: { key: 'avatar' },
				},
			});

			const result = await storageService.generateAvatarUploadUrl(
				'user-1',
				'image/png; charset=utf-8',
			);

			expect(result).toEqual({
				uploadUrl: 'https://upload.example.com/avatar',
				fields: { key: 'avatar' },
				fileUrl: expect.stringMatching(
					/^https:\/\/cdn\.example\.com\/avatars\/user-1\/.+\.png$/,
				),
			});
			expect(mocks.createPresignedPost).toHaveBeenCalledTimes(1);
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]).toMatchObject({
				Bucket: 'test-bucket',
				Expires: 600,
				Fields: { 'Content-Type': 'image/png' },
				Conditions: [
					['content-length-range', 1, 12345],
					['eq', '$Content-Type', 'image/png'],
				],
			});
		});

		it('falls back to jpeg when avatar content type is missing', async () => {
			setEnv('S3_BUCKET_NAME', 'test-bucket');
			setEnv('S3_PUBLIC_BASE_URL', 'https://cdn.example.com');
			const { storageService, mocks } = await loadStorageService({
				presignedPostResult: {
					url: 'https://upload.example.com/avatar-default',
					fields: { key: 'avatar-default' },
				},
			});

			const result = await storageService.generateAvatarUploadUrl('user-2');

			expect(result.fileUrl).toMatch(
				/^https:\/\/cdn\.example\.com\/avatars\/user-2\/.+\.jpg$/,
			);
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]).toMatchObject({
				Bucket: 'test-bucket',
				Fields: { 'Content-Type': 'image/jpeg' },
			});
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]?.Conditions).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([
						'content-length-range',
						1,
						expect.any(Number),
					]),
					['eq', '$Content-Type', 'image/jpeg'],
				]),
			);
		});

		it('generates poem audio upload urls with the configured defaults', async () => {
			setEnv('S3_BUCKET_NAME', 'test-bucket');
			setEnv('S3_PUBLIC_BASE_URL', 'https://cdn.example.com');
			setEnv('S3_SIGNED_URL_EXPIRES_IN', '450');
			setEnv('MAX_POEM_AUDIO_UPLOAD_BYTES', '54321');
			const { storageService, mocks } = await loadStorageService({
				presignedPostResult: {
					url: 'https://upload.example.com/audio',
					fields: { key: 'audio' },
				},
			});

			const result = await storageService.generatePoemAudioUploadUrl(
				'poem-9',
				'audio/mp4; charset=utf-8',
			);

			expect(result).toEqual({
				uploadUrl: 'https://upload.example.com/audio',
				fields: { key: 'audio' },
				fileUrl: expect.stringMatching(
					/^https:\/\/cdn\.example\.com\/poems\/poem-9\/audio\/.+\.m4a$/,
				),
			});
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]).toMatchObject({
				Bucket: 'test-bucket',
				Expires: 450,
				Fields: { 'Content-Type': 'audio/mp4' },
				Conditions: [
					['content-length-range', 1, 54321],
					['eq', '$Content-Type', 'audio/mp4'],
				],
			});
		});

		it('falls back to mp3 when poem audio content type is missing', async () => {
			setEnv('S3_BUCKET_NAME', 'test-bucket');
			setEnv('S3_PUBLIC_BASE_URL', 'https://cdn.example.com');
			const { storageService, mocks } = await loadStorageService({
				presignedPostResult: {
					url: 'https://upload.example.com/audio-default',
					fields: { key: 'audio-default' },
				},
			});

			const result = await storageService.generatePoemAudioUploadUrl('poem-2');

			expect(result.fileUrl).toMatch(
				/^https:\/\/cdn\.example\.com\/poems\/poem-2\/audio\/.+\.mp3$/,
			);
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]).toMatchObject({
				Bucket: 'test-bucket',
				Fields: { 'Content-Type': 'audio/mpeg' },
			});
			expect(mocks.createPresignedPost.mock.calls[0]?.[1]?.Conditions).toEqual(
				expect.arrayContaining([
					expect.arrayContaining([
						'content-length-range',
						1,
						expect.any(Number),
					]),
					['eq', '$Content-Type', 'audio/mpeg'],
				]),
			);
		});

		it('normalizes presigned post failures into internal server errors', async () => {
			setEnv('S3_BUCKET_NAME', 'test-bucket');
			const { storageService, mocks } = await loadStorageService({
				presignedPostError: new Error('boom'),
			});

			await expect(
				storageService.generateAvatarUploadUrl('user-1', 'image/png'),
			).rejects.toThrow('Failed to generate avatar upload URL');
			expect(mocks.logError).toHaveBeenCalledTimes(1);
		});
	});
});
