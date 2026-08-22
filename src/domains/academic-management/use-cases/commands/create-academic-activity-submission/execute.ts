import { ConflictError, UnknownError } from '@DomainError';
import type { CreateAcademicActivitySubmissionParams } from '../../../ports/commands';
import type { AcademicActivitySubmission } from '../../../ports/models';
import { assertCanSubmitAcademicActivity } from '../policies';

interface Dependencies {
	commandsRepository: {
		createAcademicActivitySubmission(
			params: CreateAcademicActivitySubmissionParams,
		): Promise<
			import('@SharedKernel/types').CommandResult<AcademicActivitySubmission>
		>;
	};
}

export function createAcademicActivitySubmissionFactory({
	commandsRepository,
}: Dependencies) {
	return async function createAcademicActivitySubmission(
		params: CreateAcademicActivitySubmissionParams,
	): Promise<AcademicActivitySubmission> {
		assertCanSubmitAcademicActivity({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});

		const result =
			await commandsRepository.createAcademicActivitySubmission(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Academic activity submission already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to submit academic activity',
		);
	};
}
