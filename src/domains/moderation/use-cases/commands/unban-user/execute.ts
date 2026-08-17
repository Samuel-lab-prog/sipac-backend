import type {
	CommandsRepository,
	UnbanUserParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function unbanUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function unbanUser(params: UnbanUserParams): Promise<void> {
		const { userId, requesterId, requesterRole, requesterStatus } = params;

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot unban themselves.');
		}
		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to unban users.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (!activeBan) {
			if (userExists.status === 'banned') {
				await commandsRepository.activateUser({ userId });
				return;
			}

			throw new NotFoundError('User is not banned.');
		}

		await commandsRepository.endBan({
			banId: activeBan.id,
			endAt: new Date(),
		});
	};
}
