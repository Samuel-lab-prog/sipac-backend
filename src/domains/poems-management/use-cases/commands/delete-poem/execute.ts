import type {
	CommandsRepository,
	DeletePoemParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import { ForbiddenError, NotFoundError, UnknownError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
}

export function deletePoemFactory(deps: Dependencies) {
	const { commandsRepository, queriesRepository } = deps;

	return async function deletePoem(params: DeletePoemParams): Promise<void> {
		const { meta, poemId } = params;
		const poem = await queriesRepository.selectPoemById(poemId);

		if (!poem) throw new NotFoundError('Poem not found');
		if (meta.requesterId !== poem.author.id)
			throw new ForbiddenError('You are not allowed to delete this poem');

		const result = await commandsRepository.deletePoem(poemId);
		if (result.ok === true) return result.data;

		if (result.ok === false) throw new UnknownError('Failed to delete poem');
	};
}
