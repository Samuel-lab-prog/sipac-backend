import type {
	CommandsRepository,
	MarkNotificationAsReadParams,
} from '../../../ports/commands';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { NotFoundError } from '@DomainError';

export interface MarkNotificationAsReadDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function markNotificationAsReadFactory({
	commandsRepository,
	usersContract,
}: MarkNotificationAsReadDependencies) {
	return async function markNotificationAsRead(
		params: MarkNotificationAsReadParams,
	) {
		const { userId, notificationId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const notification = await commandsRepository.markNotificationAsRead(
			notificationId,
			userId,
		);

		if (!notification.ok) {
			if (notification.code === 'NOT_FOUND')
				throw new NotFoundError('Notification not found');
			else throw new NotFoundError('Failed to mark notification as read');
		}
		return notification.data!;
	};
}
