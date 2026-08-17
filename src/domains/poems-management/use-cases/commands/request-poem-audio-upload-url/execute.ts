import { UnprocessableEntityError } from '@DomainError';
import type {
	StorageService,
	AudioUploadUrlResult,
} from '@SharedKernel/ports/Storage';
import type { QueriesRepository } from '../../../ports/queries';
import { canManagePoemAudio } from '../../policies/Policies';
import type { UserMetaData } from '../../../ports/commands';

export type RequestPoemAudioUploadUrlParams = {
	poemId: number;
	contentType: string;
	contentLength?: number;
	meta: UserMetaData;
};

interface Dependencies {
	storageService: StorageService;
	queriesRepository: QueriesRepository;
}

export function requestPoemAudioUploadUrlFactory({
	storageService,
	queriesRepository,
}: Dependencies) {
	return async function requestPoemAudioUploadUrl(
		params: RequestPoemAudioUploadUrlParams,
	): Promise<AudioUploadUrlResult> {
		const { poemId, contentType, contentLength, meta } = params;

		const maxBytes = Number(
			process.env.MAX_POEM_AUDIO_UPLOAD_BYTES ?? 20_000_000,
		);

		if (!contentType)
			throw new UnprocessableEntityError('Content type is required');

		if (contentLength !== undefined && contentLength <= 0)
			throw new UnprocessableEntityError('Content length is invalid');

		if (contentLength !== undefined && contentLength > maxBytes) {
			throw new UnprocessableEntityError(
				`Audio exceeds maximum size of ${maxBytes} bytes`,
			);
		}

		if (!storageService.validateAudioContentType(contentType))
			throw new UnprocessableEntityError('Invalid audio content type');

		await canManagePoemAudio({
			ctx: {
				author: {
					id: meta.requesterId,
					status: meta.requesterStatus,
					role: meta.requesterRole,
				},
			},
			poemId,
			queriesRepository,
		});

		return storageService.generatePoemAudioUploadUrl(
			String(poemId),
			contentType,
			contentLength,
		);
	};
}
