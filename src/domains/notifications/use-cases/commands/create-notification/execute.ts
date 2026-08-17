import type {
	CommandsRepository,
	CreateNotificationParams,
} from '../../../ports/commands';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface CreateNotificationDependencies {
	commandsRepository: CommandsRepository;
	usersContract: UsersPublicContract;
}

export function createNotificationFactory({
	commandsRepository,
	usersContract,
}: CreateNotificationDependencies) {
	return async function createNotification(params: CreateNotificationParams) {
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(params.userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const result = await commandsRepository.insertNotification(params);

		if (!result.ok) {
			throw new Error(result.error?.message || 'Failed to create notification');
		}

		return result.data!;
	};
}
