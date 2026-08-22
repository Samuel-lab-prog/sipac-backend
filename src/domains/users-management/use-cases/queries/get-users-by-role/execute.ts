import type { UserRole } from '../../../ports/models';
import type { PaginatedUsers, QueriesRepository } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getUsersByRoleFactory({ queriesRepository }: Dependencies) {
	return function getUsersByRole(params: {
		role: UserRole;
		limit?: number;
		cursor?: number;
	}): Promise<PaginatedUsers> {
		return queriesRepository.selectUsers({
			role: params.role,
			limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
			cursor: params.cursor,
		});
	};
}
