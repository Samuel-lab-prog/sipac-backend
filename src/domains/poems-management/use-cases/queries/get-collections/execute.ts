import type { QueriesRepository } from '../../../ports/queries';
import { validator } from '@SharedKernel/validators/Global';
import type { RequesterContext } from '@SharedKernel/Types';
import type { PoemCollection } from '@Domains/poems-management/ports/models';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getCollectionsFactory(deps: Dependencies) {
	const { queriesRepository } = deps;

	return function getCollections(
		params: RequesterContext,
	): Promise<PoemCollection[]> {
		const { requesterId, requesterRole, requesterStatus } = params;
		const v = validator();

		v.user({
			id: requesterId,
			role: requesterRole,
			status: requesterStatus,
			exists: true,
		}).withStatus(['active', 'suspended']);

		return queriesRepository.selectCollections(requesterId);
	};
}
