import { ForbiddenError } from '@DomainError';

type ClassSessionPolicyContext = {
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'blocked' | 'suspended';
};

export function assertCanDeleteClassSession(ctx: ClassSessionPolicyContext) {
	if (ctx.actorStatus !== 'active') {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}

	if (!['staff', 'admin'].includes(ctx.actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}
