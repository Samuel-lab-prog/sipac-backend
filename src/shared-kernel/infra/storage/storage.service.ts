import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { InternalServerError } from '@DomainError';
import { log } from '@GenericSubdomains/utils/logging/logger';
import type { StorageService } from '@SharedKernel/ports/Storage';

const allowedImageTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]);

const allowedAudioTypes = new Set([
	'audio/mpeg',
	'audio/mp3',
	'audio/wav',
	'audio/x-wav',
	'audio/webm',
	'audio/ogg',
	'audio/aac',
	'audio/mp4',
	'audio/x-m4a',
]);

const contentTypeToExtension: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
};

const audioContentTypeToExtension: Record<string, string> = {
	'audio/mpeg': 'mp3',
	'audio/mp3': 'mp3',
	'audio/wav': 'wav',
	'audio/x-wav': 'wav',
	'audio/webm': 'webm',
	'audio/ogg': 'ogg',
	'audio/aac': 'aac',
	'audio/mp4': 'm4a',
	'audio/x-m4a': 'm4a',
};

const region = process.env.AWS_REGION ?? 'us-east-1';
const bucketName = process.env.S3_BUCKET_NAME ?? 'hellopoetry1392781';
const signedUrlExpiresInSeconds = Number(
	process.env.S3_SIGNED_URL_EXPIRES_IN ?? 300,
);
const maxAvatarUploadBytes = Number(
	process.env.MAX_AVATAR_UPLOAD_BYTES ?? 5_000_000,
);
const maxPoemAudioUploadBytes = Number(
	process.env.MAX_POEM_AUDIO_UPLOAD_BYTES ?? 20_000_000,
);
const defaultPublicBaseUrl =
	process.env.S3_PUBLIC_BASE_URL ?? `https://${bucketName}.s3.amazonaws.com`;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN;

const s3Client =
	accessKeyId && secretAccessKey
		? new S3Client({
			region,
			credentials: {
				accessKeyId,
				secretAccessKey,
				sessionToken,
			},
		})
		: new S3Client({ region });

export const storageService: StorageService = {
	validateImageContentType(contentType: string): boolean {
		return allowedImageTypes.has(contentType.toLowerCase());
	},
	validateAudioContentType(contentType: string): boolean {
		const normalizedType = contentType.toLowerCase().split(';')[0] ?? '';
		return allowedAudioTypes.has(normalizedType);
	},
	async generateAvatarUploadUrl(
		userId: string,
		contentType?: string,
		_contentLength?: number,
	) {
		if (!bucketName)
			throw new InternalServerError('S3 bucket name is not configured');

		if (!region) throw new InternalServerError('AWS region is not configured');

		const id = crypto.randomUUID();
		const resolvedContentType = contentType?.toLowerCase().split(';')[0];
		const ext =
			(resolvedContentType && contentTypeToExtension[resolvedContentType]) ||
			contentTypeToExtension['image/jpeg'];
		const objectKey = `avatars/${userId}/${id}.${ext}`;
		const fileUrl = `${defaultPublicBaseUrl}/${objectKey}`;

		let uploadUrl: string;
		let fields: Record<string, string>;
		try {
			const presignedPost = await createPresignedPost(s3Client, {
				Bucket: bucketName,
				Key: objectKey,
				Expires: signedUrlExpiresInSeconds,
				Fields: {
					'Content-Type': resolvedContentType ?? 'image/jpeg',
				},
				Conditions: [
					['content-length-range', 1, maxAvatarUploadBytes],
					['eq', '$Content-Type', resolvedContentType ?? 'image/jpeg'],
				],
			});
			uploadUrl = presignedPost.url;
			fields = presignedPost.fields;
		} catch (error) {
			log.error(
				{
					error,
					bucketName,
					region,
					objectKey,
					hasAccessKey: !!accessKeyId,
				},
				'Failed to generate S3 presigned POST',
			);
			throw new InternalServerError('Failed to generate avatar upload URL');
		}

		return {
			uploadUrl,
			fields,
			fileUrl,
		};
	},
	async generatePoemAudioUploadUrl(
		poemId: string,
		contentType?: string,
		_contentLength?: number,
	) {
		if (!bucketName)
			throw new InternalServerError('S3 bucket name is not configured');

		if (!region) throw new InternalServerError('AWS region is not configured');

		const id = crypto.randomUUID();
		const resolvedContentType = contentType?.toLowerCase().split(';')[0];
		const ext =
			(resolvedContentType &&
				audioContentTypeToExtension[resolvedContentType]) ||
			audioContentTypeToExtension['audio/mpeg'];
		const objectKey = `poems/${poemId}/audio/${id}.${ext}`;
		const fileUrl = `${defaultPublicBaseUrl}/${objectKey}`;

		let uploadUrl: string;
		let fields: Record<string, string>;
		try {
			const presignedPost = await createPresignedPost(s3Client, {
				Bucket: bucketName,
				Key: objectKey,
				Expires: signedUrlExpiresInSeconds,
				Fields: {
					'Content-Type': resolvedContentType ?? 'audio/mpeg',
				},
				Conditions: [
					['content-length-range', 1, maxPoemAudioUploadBytes],
					['eq', '$Content-Type', resolvedContentType ?? 'audio/mpeg'],
				],
			});
			uploadUrl = presignedPost.url;
			fields = presignedPost.fields;
		} catch (error) {
			log.error(
				{
					error,
					bucketName,
					region,
					objectKey,
					hasAccessKey: !!accessKeyId,
				},
				'Failed to generate S3 presigned POST',
			);
			throw new InternalServerError('Failed to generate audio upload URL');
		}

		return {
			uploadUrl,
			fields,
			fileUrl,
		};
	},
};
