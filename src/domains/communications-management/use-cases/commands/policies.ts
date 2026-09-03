import { ForbiddenError } from '@DomainError';

export function assertCanManageAnnouncements(
	actorRole: 'student' | 'professor' | 'staff' | 'admin',
) {
	if (actorRole !== 'staff' && actorRole !== 'admin') {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}
