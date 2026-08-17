import type {
	CommandsRepository,
	CancelFriendRequestParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { CancelFriendRequestRecord } from '../../../ports/models';
import { ConflictError, NotFoundError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function cancelFriendRequestFactory({
	commandsRepository,
	queriesRepository,
}: Dependencies) {
	return async function cancelFriendRequest(
		params: CancelFriendRequestParams,
	): Promise<CancelFriendRequestRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError(
				'Users cannot cancel friend requests to themselves',
			);

		const request = await queriesRepository.findFriendRequest({
			requesterId,
			addresseeId,
		});
		if (!request) throw new NotFoundError('Friend request not found');

		const result = await commandsRepository.cancelFriendRequest(
			requesterId,
			addresseeId,
		);

		if (!result.ok) throw new Error(result.message);

		return result.data!;
	};
}
