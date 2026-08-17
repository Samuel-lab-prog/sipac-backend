/* eslint-disable require-await */
import { UnprocessableEntityError } from '@DomainError';
import type {
	StorageService,
	AvatarUploadUrlResult,
} from '@SharedKernel/ports/Storage';

export type RequestAvatarUploadUrlParams = {
	requesterId?: number | string;
	contentType: string;
	contentLength?: number;
};

interface Dependencies {
	storageService: StorageService;
}

export function requestAvatarUploadUrlFactory({
	storageService,
}: Dependencies) {
	return async function requestAvatarUploadUrl(
		params: RequestAvatarUploadUrlParams,
	): Promise<AvatarUploadUrlResult> {
		const { requesterId, contentType, contentLength } = params;
		const resolvedRequesterId = requesterId ?? 'guest';

		const maxBytes = Number(process.env.MAX_AVATAR_UPLOAD_BYTES ?? 5_000_000);

		if (!contentType) {
			throw new UnprocessableEntityError('Content type is required');
		}

		if (contentLength !== undefined && contentLength <= 0) {
			throw new UnprocessableEntityError('Content length is invalid');
		}

		if (contentLength !== undefined && contentLength > maxBytes) {
			throw new UnprocessableEntityError(
				`Avatar exceeds maximum size of ${maxBytes} bytes`,
			);
		}

		if (!storageService.validateImageContentType(contentType)) {
			throw new UnprocessableEntityError('Invalid image content type');
		}

		return storageService.generateAvatarUploadUrl(
			String(resolvedRequesterId),
			contentType,
			contentLength,
		);
	};
}
