import { ForbiddenError } from '@DomainError';
import type { QueriesRepository, GetUsersParams } from '../../../ports/queries';
import type { UsersPage } from '../../../ports/models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getUsersFactory({ queriesRepository }: Dependencies) {
	return function getUsers(params: GetUsersParams): Promise<UsersPage> {
		const { navigationOptions, filterOptions, sortOptions, requesterStatus } =
			params;

		if (requesterStatus === 'banned')
			throw new ForbiddenError('Banned users cannot view users list');

		return queriesRepository.selectUsers({
			navigationOptions: {
				limit: Math.min(navigationOptions.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
				cursor: navigationOptions.cursor,
			},
			sortOptions: {
				orderBy: sortOptions.by,
				orderDirection: sortOptions.order,
			},
			filterOptions: {
				searchNickname: filterOptions.searchNickname,
				role: filterOptions.role,
				status: filterOptions.status,
			},
		});
	};
}
