import { ForbiddenError } from '@DomainError';
import type { UserRole, UserStatus } from '../../public';

export type UserPolicyAction =
	| 'view_any'
	| 'view_self'
	| 'update_any'
	| 'update_self'
	| 'change_status'
	| 'change_role'
	| 'delete_any'
	| 'restore_any';

export type UserPolicyContext = {
	actorRole: UserRole;
	actorStatus: UserStatus;
	actorId: number;
	targetId: number;
};

const ACTIVE_STATUSES = new Set<UserStatus>(['active']);
const PRIVILEGED_ROLES = new Set<UserRole>(['admin', 'staff']);
const ADMIN_ROLES = new Set<UserRole>(['admin']);

function assertActorIsActive(actorStatus: UserStatus) {
	if (!ACTIVE_STATUSES.has(actorStatus)) {
		throw new ForbiddenError(
			'User account is not allowed to perform this action',
		);
	}
}

function assertActorIsPrivileged(actorRole: UserRole) {
	if (!PRIVILEGED_ROLES.has(actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

function assertActorIsAdmin(actorRole: UserRole) {
	if (!ADMIN_ROLES.has(actorRole)) {
		throw new ForbiddenError('You are not allowed to perform this action');
	}
}

function assertSelfTarget(ctx: UserPolicyContext) {
	if (ctx.actorId !== ctx.targetId) {
		throw new ForbiddenError('You can only access your own record');
	}
}

function assertNotSelfTarget(ctx: UserPolicyContext) {
	if (ctx.actorId === ctx.targetId) {
		throw new ForbiddenError('Use the self-service route for your own record');
	}
}

function canViewAny(ctx: UserPolicyContext) {
	assertActorIsPrivileged(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
}

function canViewSelf(ctx: UserPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

function canUpdateAny(ctx: UserPolicyContext) {
	assertActorIsAdmin(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

function canUpdateSelf(ctx: UserPolicyContext) {
	assertActorIsActive(ctx.actorStatus);
	assertSelfTarget(ctx);
}

function canChangeStatus(ctx: UserPolicyContext) {
	assertActorIsPrivileged(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

function canChangeRole(ctx: UserPolicyContext) {
	assertActorIsPrivileged(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

function canDeleteAny(ctx: UserPolicyContext) {
	assertActorIsPrivileged(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

function canRestoreAny(ctx: UserPolicyContext) {
	assertActorIsPrivileged(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

export function assertUserPolicy(
	action: UserPolicyAction,
	ctx: UserPolicyContext,
) {
	// eslint-disable-next-line default-case
	switch (action) {
		case 'view_any':
			canViewAny(ctx);
			return;
		case 'view_self':
			canViewSelf(ctx);
			return;
		case 'update_any':
			canUpdateAny(ctx);
			return;
		case 'update_self':
			canUpdateSelf(ctx);
			return;
		case 'change_status':
			canChangeStatus(ctx);
			return;
		case 'change_role':
			canChangeRole(ctx);
			return;
		case 'delete_any':
			canDeleteAny(ctx);
			return;
		case 'restore_any':
			canRestoreAny(ctx);
			return;
	}
}

export function assertCanAccessUser(ctx: UserPolicyContext) {
	assertUserPolicy('view_any', ctx);
}

export function assertCanUpdateUser(ctx: UserPolicyContext) {
	assertUserPolicy('update_any', ctx);
}

export function assertCanAdminUpdateUser(ctx: UserPolicyContext) {
	assertActorIsAdmin(ctx.actorRole);
	assertActorIsActive(ctx.actorStatus);
	assertNotSelfTarget(ctx);
}

export function assertCanUpdateSelf(ctx: UserPolicyContext) {
	assertUserPolicy('update_self', ctx);
}

export function assertCanChangeStatus(ctx: UserPolicyContext) {
	assertUserPolicy('change_status', ctx);
}

export function assertCanChangeRole(ctx: UserPolicyContext) {
	assertUserPolicy('change_role', ctx);
}

export function assertCanDeleteUser(ctx: UserPolicyContext) {
	assertUserPolicy('delete_any', ctx);
}

export function assertCanRestoreUser(ctx: UserPolicyContext) {
	assertUserPolicy('restore_any', ctx);
}
