import type { QueriesRepository } from '../../../ports/queries';
import type { FriendRequestsByUser } from '../../../ports/models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getMyFriendRequestsFactory({
	queriesRepository,
}: Dependencies) {
	return function getMyFriendRequests(params: {
		requesterId: number;
	}): Promise<FriendRequestsByUser> {
		return queriesRepository.selectFriendRequestsByUser(params.requesterId);
	};
}
