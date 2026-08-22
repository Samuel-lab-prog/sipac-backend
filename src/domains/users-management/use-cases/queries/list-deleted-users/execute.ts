import type { PaginatedUsers, QueriesRepository } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function listDeletedUsersFactory({ queriesRepository }: Dependencies) {
	return function listDeletedUsers(params: {
		limit?: number;
		cursor?: number;
	}): Promise<PaginatedUsers> {
		return queriesRepository.selectUsers({
			deleted: true,
			limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
			cursor: params.cursor,
		});
	};
}
