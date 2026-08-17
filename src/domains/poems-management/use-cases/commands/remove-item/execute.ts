import type { CommandsRepository, UserMetaData } from '../../../ports/commands';
import { NotFoundError, ForbiddenError, UnknownError } from '@DomainError';
import { validator } from 'GlobalValidator';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function removeCollectionItemFactory(deps: Dependencies) {
	const { commandsRepository } = deps;

	return async function removeCollectionItem(params: {
		collectionId: number;
		poemId: number;
		meta: UserMetaData;
	}): Promise<void> {
		const { requesterId, requesterRole, requesterStatus } = params.meta;
		const v = validator();

		v.user({
			id: requesterId,
			role: requesterRole,
			status: requesterStatus,
			exists: true,
		}).withStatus(['active', 'suspended']);

		const result = await commandsRepository.removeItemFromCollection({
			collectionId: params.collectionId,
			poemId: params.poemId,
			userId: requesterId,
		});

		if (result.ok) return;

		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Item not found in collection');
		if (result.code === 'FORBIDDEN')
			throw new ForbiddenError('Cannot remove item from this collection');

		throw new UnknownError('Failed to remove item from collection');
	};
}
