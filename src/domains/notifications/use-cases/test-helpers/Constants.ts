import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { NotificationPage, NotificationType } from '../../ports/models';

export const DEFAULT_USER_ID = 1;
export const DEFAULT_PERFORMER_USER_ID = 2;
export const DEFAULT_USER_ROLE: UserRole = 'author';
export const DEFAULT_USER_STATUS: UserStatus = 'active';
export const DEFAULT_NOTIFICATION_ID = 1;
export const DEFAULT_NOTIFICATION_TYPE: NotificationType =
	'POEM_COMMENT_CREATED';
export const DEFAULT_NOTIFICATION_TITLE = 'Test Notification';
export const DEFAULT_NOTIFICATION_BODY = 'This is a test notification.';
export const DEFAULT_USER_NICKNAME = 'TestUser';
export const DEFAULT_POEM_TITLE = 'Test Poem';
export const DEFAULT_PAGE: NotificationPage = {
	notifications: [],
	hasMore: false,
	nextCursor: undefined,
};
