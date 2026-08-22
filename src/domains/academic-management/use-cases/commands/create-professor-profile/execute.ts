import { ConflictError, UnknownError } from '@DomainError';
import type { ProfessorProfile } from '../../../ports/models';
import { assertCanCreateProfessorProfile } from '../policies';

interface Dependencies {
	commandsRepository: {
		createProfessorProfile(
			params: Omit<ProfessorProfile, 'id'>,
		): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	};
}

export function createProfessorProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function createProfessorProfile(
		params: Omit<ProfessorProfile, 'id'> & {
			actorId: number;
			actorRole: import('../policies').AcademicRole;
			actorStatus: import('../policies').AcademicStatus;
		},
	): Promise<ProfessorProfile> {
		assertCanCreateProfessorProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.userId,
		});
		const result = await commandsRepository.createProfessorProfile(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Professor profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to create professor profile',
		);
	};
}
