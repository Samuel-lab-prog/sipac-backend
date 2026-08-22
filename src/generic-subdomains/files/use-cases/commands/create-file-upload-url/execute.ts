import { ForbiddenError } from '@DomainError';
import type {
	FileUploadUrlResult,
	StorageService,
} from '@SharedKernel/ports/storage';

interface Dependencies {
	storageService: StorageService;
}

export type CreateFileUploadUrlParams = {
	prefix: string;
	fileName: string;
	contentType?: string;
	contentLength?: number;
};

export function createFileUploadUrlFactory({ storageService }: Dependencies) {
	return function createFileUploadUrl(
		params: CreateFileUploadUrlParams,
	): Promise<FileUploadUrlResult> {
		const { contentType } = params;
		if (contentType && !storageService.validateFileContentType(contentType)) {
			throw new ForbiddenError('Invalid file content type');
		}

		return storageService.generateFileUploadUrl(
			params.prefix,
			params.fileName,
			contentType,
			params.contentLength,
		);
	};
}
