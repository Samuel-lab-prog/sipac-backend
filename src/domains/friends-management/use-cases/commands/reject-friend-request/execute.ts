import type {
	CommandsRepository,
	RejectFriendRequestParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { FriendRequestRejectionRecord } from '../../../ports/models';
import { ConflictError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function rejectFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function rejectFriendRequest(
		params: RejectFriendRequestParams,
	): Promise<FriendRequestRejectionRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError(
				'Users cannot reject friend requests to themselves',
			);

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});

		if (!request) throw new NotFoundError('Friend request not found');

		const result = await commandsRepository.rejectFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) throw new Error(result.message);

		return result.data!;
	};
}
