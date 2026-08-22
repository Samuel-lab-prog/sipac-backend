import { ConflictError, UnknownError } from '@DomainError';
import type { CreateAcademicActivityParams } from '../../../ports/commands';
import type { AcademicActivity } from '../../../ports/models';
import { assertCanCreateAcademicActivity } from '@Domains/academic-management/public';

interface Dependencies {
	commandsRepository: {
		createAcademicActivity(
			params: CreateAcademicActivityParams,
		): Promise<import('@SharedKernel/types').CommandResult<AcademicActivity>>;
	};
}

export function createAcademicActivityFactory({
	commandsRepository,
}: Dependencies) {
	return async function createAcademicActivity(
		params: CreateAcademicActivityParams,
	): Promise<AcademicActivity> {
		assertCanCreateAcademicActivity({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});

		const result = await commandsRepository.createAcademicActivity(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Academic activity already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to create academic activity',
		);
	};
}
