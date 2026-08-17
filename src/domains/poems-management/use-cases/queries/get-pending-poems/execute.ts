import { ForbiddenError } from '@DomainError';
import type {
	QueriesRepository,
	GetPendingPoemsParams,
} from '../../../ports/queries';
import type { AuthorPoem } from '../../../ports/models';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPendingPoemsFactory({
	poemQueriesRepository,
}: Dependencies) {
	// eslint-disable-next-line require-await
	return async function getPendingPoems(
		params: GetPendingPoemsParams,
	): Promise<AuthorPoem[]> {
		const { requesterRole, requesterStatus, navigationOptions } = params;

		if (requesterRole !== 'moderator' && requesterRole !== 'admin')
			throw new ForbiddenError('Insufficient permissions');

		if (requesterStatus !== 'active')
			throw new ForbiddenError('User is not active');

		return poemQueriesRepository.selectPendingPoems({
			navigationOptions: {
				limit: Math.min(navigationOptions.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
				cursor: navigationOptions.cursor,
			},
		});
	};
}
