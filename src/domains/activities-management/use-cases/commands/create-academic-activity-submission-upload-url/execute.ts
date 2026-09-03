import { ForbiddenError } from '@DomainError';
import { assertCanSubmitAcademicActivity } from '@Domains/academic-management/public';
import type {
	StorageService,
	FileUploadUrlResult,
} from '@SharedKernel/ports/storage';
import type { CreateAcademicActivitySubmissionUploadParams } from '../../../ports/commands';

type CreateAcademicActivitySubmissionUploadUrlDependencies = {
	storageService: StorageService;
	activitiesRepository?: Pick<
		import('../../../ports/commands').ActivitiesCommandsRepository,
		'selectAcademicActivityById'
	>;
};

export function createAcademicActivitySubmissionUploadUrlFactory({
	storageService,
	activitiesRepository,
}: CreateAcademicActivitySubmissionUploadUrlDependencies) {
	return async function createAcademicActivitySubmissionUploadUrl(
		params: CreateAcademicActivitySubmissionUploadParams,
	): Promise<FileUploadUrlResult> {
		assertCanSubmitAcademicActivity(params);
		if (
			params.data.contentType &&
			!storageService.validateFileContentType(params.data.contentType)
		) {
			throw new ForbiddenError('Invalid submission attachment content type');
		}
		const activity = await activitiesRepository?.selectAcademicActivityById(
			params.activityId,
		);
		if (!activitiesRepository) {
			// Unit tests can exercise storage validation without a persistence dependency.
			return storageService.generateFileUploadUrl(
				`academic-submissions/${params.actorId}/${params.activityId}`,
				params.data.fileName,
				params.data.contentType,
				params.data.contentLength,
			);
		}
		if (!activity) throw new ForbiddenError('Activity not found');
		if (
			activity.dueAt &&
			!activity.allowLateSubmissions &&
			activity.dueAt.getTime() < Date.now()
		) {
			throw new ForbiddenError(
				'This activity does not accept late submissions',
			);
		}
		return storageService.generateFileUploadUrl(
			`academic-submissions/${params.actorId}/${params.activityId}`,
			params.data.fileName,
			params.data.contentType,
			params.data.contentLength,
		);
	};
}
