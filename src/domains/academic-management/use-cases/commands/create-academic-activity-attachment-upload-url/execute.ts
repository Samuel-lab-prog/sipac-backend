import type {
	FileUploadUrlResult,
	StorageService,
} from '@SharedKernel/ports/storage';
import { ForbiddenError } from '@DomainError';
import type { CreateAcademicActivityAttachmentUploadParams } from '../../../ports/commands';
import { assertCanManageAcademicActivityAttachments } from '../policies';
import { createFileUploadUrlFactory } from '../../../../../generic-subdomains/files/use-cases/commands/create-file-upload-url/execute';

interface Dependencies {
	storageService: StorageService;
}

export function createAcademicActivityAttachmentUploadUrlFactory({
	storageService,
}: Dependencies) {
	const uploadUrlFactory = createFileUploadUrlFactory({ storageService });

	return function createAcademicActivityAttachmentUploadUrl(
		params: CreateAcademicActivityAttachmentUploadParams,
	): Promise<FileUploadUrlResult> {
		assertCanManageAcademicActivityAttachments({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});

		const { contentType, contentLength, fileName } = params.data;
		if (contentType && !storageService.validateFileContentType(contentType)) {
			throw new ForbiddenError('Invalid activity attachment content type');
		}

		return uploadUrlFactory({
			prefix: 'academic-activities',
			fileName,
			contentType,
			contentLength,
		});
	};
}
