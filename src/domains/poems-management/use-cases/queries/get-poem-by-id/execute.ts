import type { QueriesRepository, GetPoemParams } from '../../../ports/queries';
import { canViewPoem } from '../../policies/Policies';
import type { AuthorPoem } from '../../../ports/models';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	poemQueriesRepository: QueriesRepository;
}

export function getPoemFactory({ poemQueriesRepository }: Dependencies) {
	return async function getPoem(params: GetPoemParams): Promise<AuthorPoem> {
		const poem = await poemQueriesRepository.selectPoemById(params.poemId);

		if (!poem) throw new NotFoundError('Poem not found');

		const canAccess = canViewPoem({
			author: {
				id: poem.author.id,
				friendIds: poem.author.friendIds,
				status: poem.author.status,
				directAccess: true, // valid because this is accessed via direct link
			},
			poem: {
				id: poem.id,
				status: poem.status,
				visibility: poem.visibility,
				moderationStatus: poem.moderationStatus,
			},
			viewer: {
				id: params.requesterId,
				role: params.requesterRole,
				status: params.requesterStatus,
			},
		});

		if (!canAccess) throw new ForbiddenError('Access denied to poem');

		return poem;
	};
}
