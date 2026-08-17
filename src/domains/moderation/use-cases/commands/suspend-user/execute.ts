import type {
	CommandsRepository,
	SuspendUserParams,
} from '../../../ports/commands';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import type { SuspendedUserResponse } from '../../../ports/models';
import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import type { QueriesRepository } from '@Domains/moderation/ports/queries';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function suspendUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function suspendUser(
		params: SuspendUserParams,
	): Promise<SuspendedUserResponse> {
		const {
			userId,
			reason,
			requesterId,
			requesterRole,
			requesterStatus,
			durationDays,
		} = params;

		if (requesterId === userId) {
			throw new ForbiddenError('A moderator cannot suspend themselves.');
		}

		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}

		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to suspend users.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);

		if (!userExists.exists) throw new NotFoundError('User not found.');

		const activeSuspension =
			await queriesRepository.selectActiveSuspensionByUserId({ userId });

		if (activeSuspension) {
			throw new ConflictError('User is already suspended.');
		}

		const activeBan = await queriesRepository.selectActiveBanByUserId({
			userId,
		});
		if (activeBan) throw new ConflictError('User is already banned.');

		const duration = durationDays ?? 7;
		const endAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

		return commandsRepository.createSuspension({
			userId,
			reason,
			moderatorId: requesterId,
			endAt,
		});
	};
}
