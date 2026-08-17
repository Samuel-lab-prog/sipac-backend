import type {
	CommandsRepository,
	BanUserParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import type { BannedUserResponse } from '../../../ports/models';
import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function banUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function banUser(
		params: BanUserParams,
	): Promise<BannedUserResponse> {
		const { userId, reason, requesterId, requesterRole, requesterStatus } =
			params;

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot ban themselves.');
		}
		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to ban users.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');
		if (userExists.role === 'moderator' && requesterRole !== 'admin') {
			throw new ForbiddenError('Only admins can ban moderators.');
		}

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (activeBan) throw new ConflictError('User is already banned.');

		return commandsRepository.createBan({
			userId,
			reason,
			moderatorId: requesterId,
		});
	};
}
