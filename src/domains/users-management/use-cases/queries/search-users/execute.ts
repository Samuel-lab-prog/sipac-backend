import type {
	QueriesRepository,
	SearchUsersParams,
} from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function searchUsersFactory({ queriesRepository }: Dependencies) {
	return function searchUsers(params: SearchUsersParams) {
		return queriesRepository.selectUsers({
			searchTerm: params.searchTerm,
			limit: Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
			cursor: params.cursor,
		});
	};
}
