import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { LinkProfessorToDepartmentParams } from '../../../ports/commands';
import type { ProfessorProfile } from '../../../ports/models';
import { assertCanLinkProfessorToDepartment } from '../policies';

interface Dependencies {
	commandsRepository: {
		linkProfessorToDepartment(
			userId: number,
			params: {
				departmentId: number | null;
			},
		): Promise<import('@SharedKernel/types').CommandResult<ProfessorProfile>>;
	};
}

export function linkProfessorToDepartmentFactory({
	commandsRepository,
}: Dependencies) {
	return async function linkProfessorToDepartment(
		params: LinkProfessorToDepartmentParams,
	): Promise<ProfessorProfile> {
		assertCanLinkProfessorToDepartment({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const result = await commandsRepository.linkProfessorToDepartment(
			params.targetUserId,
			{
				departmentId: params.departmentId,
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
			result.message ?? 'Failed to link professor to department',
		);
	};
}
