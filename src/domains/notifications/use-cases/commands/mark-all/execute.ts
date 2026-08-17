import type { CommandsRepository } from '../../../ports/commands';

import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { UnknownError } from '@DomainError';

export interface MarkAllAsReadDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function markAllNotificationsAsReadFactory({
	commandsRepository,
	usersContract,
}: MarkAllAsReadDependencies) {
	return async function markAllNotificationsAsRead(params: { userId: number }) {
		const { userId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const result = await commandsRepository.markAllAsRead({
			userId,
		});

		if (!result.ok)
			throw new UnknownError('Failed to mark notifications as read');
	};
}
