import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { UpdateStaffProfileParams } from '../../../ports/commands';
import type { StaffProfile } from '../../../ports/models';
import { assertCanUpdateStaffProfile } from '../policies';

interface Dependencies {
	commandsRepository: {
		updateStaffProfile(
			userId: number,
			params: Partial<{
				departmentId: number | null;
			}>,
		): Promise<import('@SharedKernel/types').CommandResult<StaffProfile>>;
	};
}

export function updateStaffProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function updateStaffProfile(
		params: UpdateStaffProfileParams,
	): Promise<StaffProfile> {
		assertCanUpdateStaffProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const result = await commandsRepository.updateStaffProfile(
			params.targetUserId,
			{
				departmentId: params.departmentId,
			},
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Staff profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'Staff profile already exists');
		throw new UnknownError(result.message ?? 'Failed to update staff profile');
	};
}
