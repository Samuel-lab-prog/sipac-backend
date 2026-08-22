import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import {
	assertCanUnlinkProfessorFromDepartment,
	type AcademicPolicyContext,
} from '../policies';
import type { ProfessorProfile } from '../../../ports/models';

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

export function unlinkProfessorFromDepartmentFactory({
	commandsRepository,
}: Dependencies) {
	return async function unlinkProfessorFromDepartment(
		params: AcademicPolicyContext,
	): Promise<ProfessorProfile> {
		assertCanUnlinkProfessorFromDepartment(params);
		const result = await commandsRepository.linkProfessorToDepartment(
			params.targetUserId,
			{ departmentId: null },
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Professor profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Professor profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to unlink professor from department',
		);
	};
}
