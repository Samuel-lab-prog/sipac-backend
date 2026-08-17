import { ForbiddenError } from '@DomainError';
import type { UserStatus } from '../../ports/models';

export type CanUpdatePolicyInput = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
};

export function canUpdateData(c: CanUpdatePolicyInput): void {
	const isResourceOwner = c.requesterId === c.targetId;
	const isBanned = c.requesterStatus === 'banned';

	if (!isResourceOwner)
		throw new ForbiddenError('Cross-user update not allowed');
	if (isBanned) throw new ForbiddenError('Banned users cannot update data');
}
