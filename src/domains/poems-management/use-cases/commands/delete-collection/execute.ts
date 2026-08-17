import type { CommandsRepository, UserMetaData } from '../../../ports/commands';
import { NotFoundError, ForbiddenError, UnknownError } from '@DomainError';
import { validator } from 'GlobalValidator';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function deleteCollectionFactory(deps: Dependencies) {
	const { commandsRepository } = deps;

	return async function deleteCollection(params: {
		collectionId: number;
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

		const result = await commandsRepository.deleteCollection({
			collectionId: params.collectionId,
			userId: requesterId,
		});

		if (result.ok) return;

		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Collection not found');
		if (result.code === 'FORBIDDEN')
			throw new ForbiddenError('Cannot delete collection');

		throw new UnknownError('Failed to delete collection');
	};
}
