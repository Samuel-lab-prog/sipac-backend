import { ForbiddenError } from '@DomainError';
import type {
	QueriesRepository,
	SearchPoemsParams,
} from '../../../ports/queries';
import type { PoemPreviewPage } from '../../../ports/models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPoemsFactory({ queriesRepository }: Dependencies) {
	return function getPoems(
		params: SearchPoemsParams,
	): Promise<PoemPreviewPage> {
		const { navigationOptions, filterOptions, sortOptions, requesterStatus } =
			params;

		if (requesterStatus === 'banned')
			return Promise.reject(
				new ForbiddenError('Banned users cannot view poems list'),
			);
		return queriesRepository.selectPoems({
			navigationOptions: {
				limit: Math.min(navigationOptions.limit ?? DEFAULT_LIMIT, MAX_LIMIT),
				cursor: navigationOptions.cursor,
			},
			sortOptions: {
				orderBy: sortOptions?.orderBy ?? 'createdAt',
				orderDirection: sortOptions?.orderDirection ?? 'desc',
			},
			filterOptions: {
				searchTitle: filterOptions?.searchTitle,
				tags: filterOptions?.tags,
			},
		});
	};
}
