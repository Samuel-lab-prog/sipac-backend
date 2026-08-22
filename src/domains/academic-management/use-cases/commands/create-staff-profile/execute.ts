import { ConflictError, UnknownError } from '@DomainError';
import type { StaffProfile } from '../../../ports/models';
import { assertCanCreateStaffProfile } from '../policies';

interface Dependencies {
	commandsRepository: {
		createStaffProfile(
			params: Omit<StaffProfile, 'id'>,
		): Promise<import('@SharedKernel/types').CommandResult<StaffProfile>>;
	};
}

export function createStaffProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function createStaffProfile(
		params: Omit<StaffProfile, 'id'> & {
			actorId: number;
			actorRole: import('../policies').AcademicRole;
			actorStatus: import('../policies').AcademicStatus;
		},
	): Promise<StaffProfile> {
		assertCanCreateStaffProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.userId,
		});
		const result = await commandsRepository.createStaffProfile(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'Staff profile already exists');
		throw new UnknownError(result.message ?? 'Failed to create staff profile');
	};
}
