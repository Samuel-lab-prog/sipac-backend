import { ForbiddenError } from '@DomainError';

type ClassSessionPolicyContext = {
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'blocked' | 'suspended';
};

const ACTIVE_STATUSES = new Set<ClassSessionPolicyContext['actorStatus']>([
	'active',
]);
const PRIVILEGED_ROLES = new Set<ClassSessionPolicyContext['actorRole']>([
	'admin',
	'staff',
]);

export function assertCanDeleteClassSession(ctx: ClassSessionPolicyContext) {
	if (!ACTIVE_STATUSES.has(ctx.actorStatus)) {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}

	if (!PRIVILEGED_ROLES.has(ctx.actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}
