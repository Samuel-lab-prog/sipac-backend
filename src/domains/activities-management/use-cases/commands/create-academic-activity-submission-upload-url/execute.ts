import { ForbiddenError } from '@DomainError';
import { assertCanSubmitAcademicActivity } from '@Domains/academic-management/public';
import type {
	StorageService,
	FileUploadUrlResult,
} from '@SharedKernel/ports/storage';
import type { CreateAcademicActivitySubmissionUploadParams } from '../../../ports/commands';

type CreateAcademicActivitySubmissionUploadUrlDependencies = {
	storageService: StorageService;
};

export function createAcademicActivitySubmissionUploadUrlFactory({
	storageService,
}: CreateAcademicActivitySubmissionUploadUrlDependencies) {
	return function createAcademicActivitySubmissionUploadUrl(
		params: CreateAcademicActivitySubmissionUploadParams,
	): Promise<FileUploadUrlResult> {
		assertCanSubmitAcademicActivity(params);
		if (
			params.data.contentType &&
			!storageService.validateFileContentType(params.data.contentType)
		) {
			throw new ForbiddenError('Invalid submission attachment content type');
		}
		return storageService.generateFileUploadUrl(
			`academic-submissions/${params.actorId}/${params.activityId}`,
			params.data.fileName,
			params.data.contentType,
			params.data.contentLength,
		);
	};
}
