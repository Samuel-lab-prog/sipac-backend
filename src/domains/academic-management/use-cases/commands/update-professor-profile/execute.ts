import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { UpdateProfessorProfileParams } from '../../../ports/commands';
import type { ProfessorProfile } from '../../../ports/models';
import { assertCanUpdateProfessorProfile } from '../policies';

interface Dependencies {
	commandsRepository: {
		updateProfessorProfile(
			userId: number,
			params: Partial<{
				registryCode: string | null;
				departmentId: number | null;
				title: string | null;
				workload: number | null;
			}>,
		): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	};
}

export function updateProfessorProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function updateProfessorProfile(
		params: UpdateProfessorProfileParams,
	): Promise<ProfessorProfile> {
		assertCanUpdateProfessorProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const result = await commandsRepository.updateProfessorProfile(
			params.targetUserId,
			{
				registryCode: params.registryCode,
				departmentId: params.departmentId,
				title: params.title,
				workload: params.workload,
			},
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Professor profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Professor profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to update professor profile',
		);
	};
}
