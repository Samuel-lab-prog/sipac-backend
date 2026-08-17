import type {
	QueriesRepository,
	GetUserNotificationsParams,
} from '../../../ports/queries';

import { validator } from '@SharedKernel/validators/Global';
import { type UsersPublicContract } from '@Domains/users-management/public/Index';
import type { NotificationPage } from '@Domains/notifications/ports/models';

export interface GetUserNotificationsDependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

const DEFAULT_LIMIT = 20;
const DEFAULT_ONLY_UNREAD = false;
export function getUserNotificationsFactory({
	queriesRepository,
	usersContract,
}: GetUserNotificationsDependencies) {
	return async function getUserNotifications(
		params: GetUserNotificationsParams,
	): Promise<NotificationPage> {
		const {
			userId,
			onlyUnread = DEFAULT_ONLY_UNREAD,
			limit = DEFAULT_LIMIT,
			nextCursor,
		} = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const notifications = await queriesRepository.selectUserNotifications(
			userId,
			{
				onlyUnread,
				limit,
				nextCursor,
			},
		);

		return notifications;
	};
}
