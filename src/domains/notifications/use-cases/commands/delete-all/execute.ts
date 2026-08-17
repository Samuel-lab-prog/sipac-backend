import type { CommandsRepository } from '../../../ports/commands';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { UnknownError } from '@DomainError';

export interface DeleteAllNotificationsDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function deleteAllNotificationsFactory({
	commandsRepository,
	usersContract,
}: DeleteAllNotificationsDependencies) {
	return async function deleteAllNotifications(params: { userId: number }) {
		const { userId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const result = await commandsRepository.deleteAllNotifications({
			userId,
		});

		if (!result.ok)
			throw new UnknownError('Failed to delete all notifications');
	};
}
