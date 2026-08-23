import { ForbiddenError } from '@DomainError';
import type { AcademicPolicyContext } from '@Domains/academic-management/public';

export function assertCanMarkAttendance(ctx: AcademicPolicyContext) {
	if (ctx.actorStatus !== 'active') {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}

	if (!['professor', 'staff', 'admin'].includes(ctx.actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

type AttendanceDeletePolicyContext = {
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'pending' | 'blocked' | 'suspended';
};

export function assertCanDeleteAttendance(ctx: AttendanceDeletePolicyContext) {
	if (ctx.actorStatus !== 'active') {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}

	if (!['staff', 'admin'].includes(ctx.actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}
