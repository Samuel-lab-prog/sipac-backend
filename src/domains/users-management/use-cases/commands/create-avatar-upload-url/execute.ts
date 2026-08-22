import { ForbiddenError } from '@DomainError';
import type {
	AvatarUploadUrlResult,
	StorageService,
} from '@SharedKernel/ports/storage';
import type { CreateAvatarUploadUrlParams } from '../../../ports/commands';
import { assertCanUpdateSelf } from '../policies';

interface Dependencies {
	storageService: StorageService;
}

export function createAvatarUploadUrlFactory({ storageService }: Dependencies) {
	return async function createAvatarUploadUrl(
		params: CreateAvatarUploadUrlParams,
	): Promise<AvatarUploadUrlResult> {
		assertCanUpdateSelf({
			actorId: params.clientId,
			targetId: params.clientId,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});

		const { contentType, contentLength } = params.data;
		if (contentType && !storageService.validateImageContentType(contentType)) {
			throw new ForbiddenError('Invalid avatar content type');
		}

		return storageService.generateAvatarUploadUrl(
			String(params.clientId),
			contentType,
			contentLength,
		);
	};
}
