import { ForbiddenError } from '@DomainError';

const ALLOWED_ADMIN_UPDATE_ROLES = new Set(['admin', 'staff']);
const ALLOWED_ADMIN_UPDATE_STATUSES = new Set(['active']);
const ALLOWED_SELF_UPDATE_STATUSES = new Set(['active']);
const ALLOWED_ADMIN_ACCESS_ROLES = new Set(['admin', 'staff']);

export function assertCanUpdateUser(role: string, status: string) {
	if (!ALLOWED_ADMIN_UPDATE_ROLES.has(role)) {
		throw new ForbiddenError('You are not allowed to update this user');
	}

	if (!ALLOWED_ADMIN_UPDATE_STATUSES.has(status)) {
		throw new ForbiddenError('User account is not allowed to update data');
	}
}

export function assertCanUpdateSelf(status: string) {
	if (!ALLOWED_SELF_UPDATE_STATUSES.has(status)) {
		throw new ForbiddenError('User account is not allowed to update data');
	}
}

export function assertCanAccessUser(role: string, status: string) {
	if (!ALLOWED_ADMIN_ACCESS_ROLES.has(role)) {
		throw new ForbiddenError('You are not allowed to access this user');
	}

	if (!ALLOWED_ADMIN_UPDATE_STATUSES.has(status)) {
		throw new ForbiddenError('User account is not allowed to access data');
	}
}

export const assertCanDeleteUser = assertCanAccessUser;
export const assertCanRestoreUser = assertCanAccessUser;
