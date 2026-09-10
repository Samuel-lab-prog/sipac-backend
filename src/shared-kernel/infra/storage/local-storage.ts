import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import type { StorageService } from '@SharedKernel/ports/storage';

const imageTypes = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/gif',
]);
const audioTypes = new Set([
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
const fileTypes = new Set([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
]);
export const localStorageRoot = resolve(
	process.env.LOCAL_STORAGE_DIR || 'storage/dev',
);
export const pendingUploads = new Map<
	string,
	{ key: string; contentType: string; maxBytes: number; expires: number }
>();

export function createLocalStorageService(): StorageService {
	const baseUrl = (
		process.env.LOCAL_STORAGE_PUBLIC_URL || 'http://localhost:5000/api/v1'
	).replace(/\/$/, '');
	async function createUpload(
		contentType: string,
		maxBytes: number,
		contentLength?: number,
	) {
		if (
			contentLength !== undefined &&
			(contentLength < 1 || contentLength > maxBytes)
		)
			throw new Error('Invalid upload size');
		const now = Date.now();
		for (const [token, upload] of pendingUploads)
			if (upload.expires < now) pendingUploads.delete(token);
		const key = randomUUID();
		const token = randomUUID();
		pendingUploads.set(token, {
			key,
			contentType,
			maxBytes,
			expires: now + 300_000,
		});
		return {
			uploadUrl: `${baseUrl}/storage/upload`,
			fields: { token },
			fileUrl: `${baseUrl}/storage/files/${key}`,
		};
	}
	return {
		validateImageContentType: (type) => imageTypes.has(type),
		validateAudioContentType: (type) => audioTypes.has(type),
		validateFileContentType: (type) => fileTypes.has(type),
		generateAvatarUploadUrl: async (_id, type = 'image/jpeg', length) => {
			if (!imageTypes.has(type)) throw new Error('Invalid image type');
			return createUpload(
				type,
				Number(process.env.MAX_AVATAR_UPLOAD_BYTES || 5_000_000),
				length,
			);
		},
		generatePoemAudioUploadUrl: async (_id, type = 'audio/mpeg', length) => {
			if (!audioTypes.has(type)) throw new Error('Invalid audio type');
			return createUpload(
				type,
				Number(process.env.MAX_POEM_AUDIO_UPLOAD_BYTES || 20_000_000),
				length,
			);
		},
		generateFileUploadUrl: async (
			_prefix,
			_name,
			type = 'application/pdf',
			length,
		) => {
			if (!fileTypes.has(type)) throw new Error('Invalid file type');
			return createUpload(
				type,
				Number(process.env.MAX_ACADEMIC_FILE_UPLOAD_BYTES || 25_000_000),
				length,
			);
		},
	};
}
