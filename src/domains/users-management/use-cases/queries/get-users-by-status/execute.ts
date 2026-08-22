import type { UserStatus } from '../../../ports/models';
import type { PaginatedUsers, QueriesRepository } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getUsersByStatusFactory({ queriesRepository }: Dependencies) {
	return function getUsersByStatus(params: {
		status: UserStatus;
		limit?: number;
		cursor?: number;
	}): Promise<PaginatedUsers> {
		return queriesRepository.selectUsers({
			status: params.status,
			limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
			cursor: params.cursor,
		});
	};
}
