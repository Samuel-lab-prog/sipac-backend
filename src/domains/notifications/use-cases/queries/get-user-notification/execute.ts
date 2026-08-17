import type {
	QueriesRepository,
	GetNotificationByIdParams,
} from '../../../ports/queries';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { Notification } from '@Domains/notifications/ports/models';

export interface GetNotificationByIdDependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function getNotificationByIdFactory({
	queriesRepository,
	usersContract,
}: GetNotificationByIdDependencies) {
	return async function getNotificationById(
		params: GetNotificationByIdParams,
	): Promise<Notification> {
		const { userId, notificationId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const notification = await queriesRepository.selectNotificationById(
			notificationId,
			userId,
		);

		v.ensure(notification)
			.notNull('Notification not found')
			.notUndefined('Notification not found');

		return notification!;
	};
}
