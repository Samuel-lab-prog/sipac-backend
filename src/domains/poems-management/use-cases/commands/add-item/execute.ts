import type { CommandsRepository, UserMetaData } from '../../../ports/commands';
import {
	ConflictError,
	NotFoundError,
	ForbiddenError,
	UnknownError,
} from '@DomainError';
import { validator } from 'GlobalValidator';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function addCollectionItemFactory(deps: Dependencies) {
	const { commandsRepository } = deps;

	return async function addCollectionItem(params: {
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

		const result = await commandsRepository.addItemToCollection({
			collectionId: params.collectionId,
			poemId: params.poemId,
			userId: requesterId,
		});

		if (result.ok) return;

		if (result.code === 'CONFLICT')
			throw new ConflictError('Poem already in collection');
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Collection or poem not found');
		if (result.code === 'FORBIDDEN')
			throw new ForbiddenError('Cannot add item to this collection');

		throw new UnknownError('Failed to add item to collection');
	};
}
