import type {
	QueriesRepository,
	GetMyPoemsParams,
} from '../../../ports/queries';
import type { MyPoem } from '../../../ports/models';
import { canViewPoem } from '../../policies/Policies';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export function getMyPoemsFactory({ poemQueriesRepository }: Dependencies) {
	return async function getMyPoems(
		params: GetMyPoemsParams,
	): Promise<MyPoem[]> {
		const poems = await poemQueriesRepository.selectMyPoems(params.requesterId);
		return poems.filter((poem) =>
			canViewPoem({
				author: { id: params.requesterId },
				poem: {
					id: poem.id,
					status: poem.status,
					visibility: poem.visibility,
					moderationStatus: poem.moderationStatus,
				},
				viewer: { id: params.requesterId },
			}),
		);
	};
}
