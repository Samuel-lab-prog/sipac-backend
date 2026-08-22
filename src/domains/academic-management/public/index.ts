import { ForbiddenError } from '@DomainError';

export type AcademicRole = 'student' | 'professor' | 'staff' | 'admin';
export type AcademicStatus = 'active' | 'blocked' | 'suspended';

export type AcademicPolicyContext = {
	actorId: number;
	actorRole: AcademicRole;
	actorStatus: AcademicStatus;
	targetUserId: number;
};

function assertActorIsActive(actorStatus: AcademicStatus) {
	if (actorStatus !== 'active') {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}
}

function assertActorIsPrivileged(actorRole: AcademicRole) {
	if (!['admin', 'staff'].includes(actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

function assertSelfTarget(ctx: AcademicPolicyContext) {
	if (ctx.actorId !== ctx.targetUserId) {
		throw new ForbiddenError('You can only create your own profile');
	}
}

export function assertCanMarkAttendance(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
}

export function assertCanCreateAcademicActivity(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
}

export function assertCanSubmitAcademicActivity(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}
