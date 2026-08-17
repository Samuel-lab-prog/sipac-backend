import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export const unavailableUserName = 'Unavailable user';
export const unavailableUserNickname = 'unavailable_user';
export const unavailableCommentContent =
	'This comment is unavailable because the author was banned.';

export type ModerationViewer = {
	id?: number;
	role?: UserRole | string;
	status?: UserStatus | string;
};

export const publicUserStatusFilter = { not: 'banned' as const };
export const publicUserRelationFilter = { status: publicUserStatusFilter };

export function canViewBannedUserHistory(viewer: ModerationViewer): boolean {
	return (
		viewer.status === 'active' &&
		(viewer.role === 'admin' || viewer.role === 'moderator')
	);
}

export function canExposeUserToViewer(
	target: { id?: number; status?: UserStatus | string | null },
	viewer: ModerationViewer,
): boolean {
	if (target.status !== 'banned') return true;
	if (target.id !== undefined && viewer.id === target.id) return true;
	return canViewBannedUserHistory(viewer);
}

export function isBannedUser(status?: UserStatus | string | null): boolean {
	return status === 'banned';
}
