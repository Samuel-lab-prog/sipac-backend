import { ForbiddenError } from '@DomainError';

export type AcademicRole = 'student' | 'professor' | 'staff' | 'admin';
export type AcademicStatus = 'active' | 'blocked' | 'suspended';

export type AcademicPolicyContext = {
	actorId: number;
	actorRole: AcademicRole;
	actorStatus: AcademicStatus;
	targetUserId: number;
};

const ACTIVE_STATUSES = new Set<AcademicStatus>(['active']);
const ADMIN_ROLES = new Set<AcademicRole>(['admin']);
const PRIVILEGED_ROLES = new Set<AcademicRole>(['admin', 'staff']);

function assertActorIsActive(actorStatus: AcademicStatus) {
	if (!ACTIVE_STATUSES.has(actorStatus)) {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}
}

function assertActorIsAdmin(actorRole: AcademicRole) {
	if (!ADMIN_ROLES.has(actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

function assertActorIsPrivileged(actorRole: AcademicRole) {
	if (!PRIVILEGED_ROLES.has(actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

function assertSelfTarget(ctx: AcademicPolicyContext) {
	if (ctx.actorId !== ctx.targetUserId) {
		throw new ForbiddenError('You can only create your own profile');
	}
}

function assertNotSelfTarget(ctx: AcademicPolicyContext) {
	if (ctx.actorId === ctx.targetUserId) {
		throw new ForbiddenError('Use the self-service route for your own profile');
	}
}

export function assertCanCreateStudentProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

export function assertCanCreateProfessorProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanCreateStaffProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsAdmin(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanUpdateStudentProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

export function assertCanUpdateProfessorProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanUpdateStaffProfile(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsAdmin(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanLinkStudentToCourse(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

export function assertCanLinkProfessorToDepartment(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanUnlinkStudentFromCourse(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

export function assertCanUnlinkProfessorFromDepartment(
	ctx: AcademicPolicyContext,
) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
	assertNotSelfTarget(ctx);
}

export function assertCanMarkAttendance(ctx: AcademicPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertActorIsPrivileged(ctx.actorRole);
}
