import type { CommandsRepository, UserMetaData } from '../../../ports/commands';
import { ConflictError, UnknownError } from '@DomainError';
import { validator } from 'GlobalValidator';
import type { CreateCollection } from '@Domains/poems-management/ports/models';
import type { QueriesRepository } from '@Domains/poems-management/ports/queries';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function createCollectionFactory(deps: Dependencies) {
	const { commandsRepository } = deps;
	return async function createCollection(params: {
		data: CreateCollection;
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

		const result = await commandsRepository.createCollection({
			data: params.data,
		});
		if (result.ok === true) return;

		if (result.code === 'CONFLICT')
			throw new ConflictError('Collection already exists');

		throw new UnknownError('Failed to create collection');
	};
}
