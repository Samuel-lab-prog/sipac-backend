import type {
	CommandsRepository,
	DeleteFriendParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import { ConflictError, NotFoundError } from '@DomainError';
import type { RemovedFriendRecord } from '../../../ports/models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function deleteFriendFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function deleteFriend(
		params: DeleteFriendParams,
	): Promise<RemovedFriendRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError('Users cannot delete friends to themselves');

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (!friendship) throw new NotFoundError('Friendship not found');

		const result = await commandsRepository.deleteFriend(
			requesterId,
			addresseeId,
		);

		if (!result.ok) throw new Error(result.message);

		return result.data!;
	};
}
