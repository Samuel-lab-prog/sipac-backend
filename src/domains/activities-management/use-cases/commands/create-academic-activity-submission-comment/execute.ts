import { ForbiddenError, UnknownError } from '@DomainError';
import { assertCanSubmitAcademicActivity } from '@Domains/academic-management/public';
import type {
	CreateAcademicActivitySubmissionCommentParams,
	ActivitiesCommandsRepository,
} from '../../../ports/commands';
import type { AcademicActivitySubmissionComment } from '../../../ports/models';

export function createAcademicActivitySubmissionCommentFactory({
	commandsRepository,
}: {
	commandsRepository: Pick<
		ActivitiesCommandsRepository,
		'createAcademicActivitySubmissionComment'
	>;
}) {
	return async function createAcademicActivitySubmissionComment(
		params: CreateAcademicActivitySubmissionCommentParams,
	): Promise<AcademicActivitySubmissionComment> {
		assertCanSubmitAcademicActivity(params);
		const result =
			await commandsRepository.createAcademicActivitySubmissionComment(params);
		if (result.ok) return result.data;
		if (result.code === 'FORBIDDEN')
			throw new ForbiddenError(
				result.message ?? 'You cannot comment on this submission',
			);
		throw new UnknownError(
			result.message ?? 'Failed to create submission comment',
		);
	};
}
